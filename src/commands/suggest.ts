import {Command, Flags} from '@oclif/core'

import {readConfig} from '../config'
import {getSuggestedIssues} from '../github/issues'
import {isMuted, readState} from '../state'
import {colors} from '../ui/colors'

export default class Suggest extends Command {
  static description = 'Suggest open issues from your starred repositories.'

  static flags = {
    beginner: Flags.boolean({description: 'Only show good first issue candidates'}),
    list: Flags.string({description: 'Use a named repo list from suezconfig.json instead of starred repositories'}),
    repos: Flags.integer({description: 'Number of starred repositories to scan', default: 20}),
    issues: Flags.integer({description: 'Number of issues to read per repository', default: 5}),
    muted: Flags.boolean({description: 'Include muted issues'}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Suggest)
    const config = await readConfig()
    const state = await readState()

    if (flags.list && !config.repoLists[flags.list]) {
      this.error(`Unknown repo list "${flags.list}". Add it with: suez repos add ${flags.list} owner/repo`)
    }

    const issues = await getSuggestedIssues(config, {
      beginner: flags.beginner,
      repoLimit: flags.repos,
      issueLimit: flags.issues,
      repoList: flags.list,
    }).then((items) =>
      flags.muted
        ? items
        : items.filter((issue) => !isMuted(state.mutedIssues, issue.id) && !isMuted(state.mutedIssues, issue.url)),
    )

    if (!issues.length) {
      this.log(colors.yellow('No matching issues found.'))
      return
    }

    for (const issue of issues) {
      const language = issue.repository.primaryLanguage ? colors.dim(` ${issue.repository.primaryLanguage}`) : ''
      const labels = issue.labels.length ? colors.dim(` [${issue.labels.join(', ')}]`) : ''
      const size = issue.size ? colors.yellow(` ${issue.size}`) : ''
      const reasons = issue.scoreReasons.length ? colors.dim(` (${issue.scoreReasons.join(', ')})`) : ''

      this.log(
        `${colors.bold(issue.repository.nameWithOwner)}#${issue.number}${language}${size} ${colors.green(`score ${issue.score}`)} - ${issue.title}${labels}`,
      )
      this.log(`  ${colors.blue(issue.url)}${reasons}`)
    }
  }
}
