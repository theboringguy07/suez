import {Args, Command, Flags} from '@oclif/core'

import {readState, writeState} from '../state'
import {colors} from '../ui/colors'
import {parseIssueUrl} from '../utils/github-url'

export default class Mute extends Command {
  static description = 'Hide an issue from future suggestions.'

  static args = {
    issueUrl: Args.string({description: 'GitHub issue URL', required: true}),
  }

  static flags = {
    reason: Flags.string({description: 'Optional reason for muting this issue'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Mute)
    const issue = parseIssueUrl(args.issueUrl)
    const state = await readState()
    const issueId = `${issue.repository}#${issue.number}`

    if (!state.mutedIssues.some((muted) => muted.issueId === issueId || muted.issueUrl === args.issueUrl)) {
      state.mutedIssues.push({
        issueId,
        issueUrl: args.issueUrl,
        reason: flags.reason,
        mutedAt: new Date().toISOString(),
      })
    }

    await writeState(state)
    this.log(colors.green(`Muted ${issueId}`))
  }
}
