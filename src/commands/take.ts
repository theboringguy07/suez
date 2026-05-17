import {Args, Command, Flags} from '@oclif/core'

import {readConfig} from '../config'
import {setupLocalRepository} from '../git/setup'
import {addIssueComment, getIssueDetails} from '../github/issue-details'
import {readWips, findActiveWipForRepo, writeWips} from '../state'
import {colors} from '../ui/colors'
import {confirm, promptText} from '../ui/prompts'
import {parseIssueUrl} from '../utils/github-url'

export default class Take extends Command {
  static description = 'Track a GitHub issue as your active WIP and optionally set up the repo.'

  static args = {
    issueUrl: Args.string({description: 'GitHub issue URL', required: true}),
  }

  static flags = {
    title: Flags.string({description: 'Issue title to store locally'}),
    comment: Flags.boolean({description: 'Prompt to post the configured WIP comment'}),
    setup: Flags.boolean({description: 'Clone/update the repository and create an issue branch'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Take)
    const parsedIssue = parseIssueUrl(args.issueUrl)
    const config = await readConfig()
    const issue = config.githubToken
      ? await getIssueDetails(config.githubToken, parsedIssue)
      : {
          id: `${parsedIssue.repository}#${parsedIssue.number}`,
          number: parsedIssue.number,
          title: flags.title || 'Untitled issue',
          url: args.issueUrl,
          labels: [],
          score: 0,
          scoreReasons: [],
          repository: {
            nameWithOwner: parsedIssue.repository,
            url: `https://github.com/${parsedIssue.repository}`,
            cloneUrl: `https://github.com/${parsedIssue.repository}.git`,
            defaultBranch: 'main',
          },
        }
    const wips = await readWips()
    const active = findActiveWipForRepo(wips, issue.repository.nameWithOwner)

    if (active) {
      this.error(`You already have an active WIP for ${issue.repository.nameWithOwner}: ${active.issueUrl}`)
    }

    if (flags.comment && config.githubToken) {
      const shouldComment = await confirm('Post your WIP comment to GitHub?', true)
      if (shouldComment) {
        const body = await promptText('Comment body', config.wipCommentTemplate)
        const commentUrl = await addIssueComment(config.githubToken, issue.id, body)
        this.log(colors.green(`Comment posted${commentUrl ? `: ${commentUrl}` : '.'}`))
      }
    }

    if (flags.setup) {
      const directory = await setupLocalRepository(config, issue)
      this.log(colors.green(`Repository ready at ${directory}`))
    }

    wips.push({
      issueId: issue.id,
      issueNumber: issue.number,
      issueUrl: issue.url,
      title: flags.title || issue.title,
      repository: issue.repository.nameWithOwner,
      startedAt: new Date().toISOString(),
      status: 'active',
    })

    await writeWips(wips)
    this.log(colors.green(`Tracking ${issue.repository.nameWithOwner}#${issue.number}`))
  }
}
