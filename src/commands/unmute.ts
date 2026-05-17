import {Args, Command} from '@oclif/core'

import {readState, writeState} from '../state'
import {colors} from '../ui/colors'
import {parseIssueUrl} from '../utils/github-url'

export default class Unmute extends Command {
  static description = 'Allow an issue to appear in suggestions again.'

  static args = {
    issueUrl: Args.string({description: 'GitHub issue URL', required: true}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(Unmute)
    const issue = parseIssueUrl(args.issueUrl)
    const issueId = `${issue.repository}#${issue.number}`
    const state = await readState()

    await writeState({
      ...state,
      mutedIssues: state.mutedIssues.filter((muted) => muted.issueId !== issueId && muted.issueUrl !== args.issueUrl),
    })

    this.log(colors.green(`Unmuted ${issueId}`))
  }
}
