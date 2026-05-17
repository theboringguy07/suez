import {Command} from '@oclif/core'

import {readState} from '../state'
import {colors} from '../ui/colors'

export default class Status extends Command {
  static description = 'Show locally tracked Suez work in progress.'

  async run(): Promise<void> {
    const state = await readState()
    const active = state.wips.filter((wip) => wip.status === 'active')

    if (!active.length) {
      this.log(colors.yellow('No active WIP issues.'))
    } else {
      this.log(colors.bold('Active WIP'))
      for (const wip of active) {
        this.log(`${colors.bold(`${wip.repository}#${wip.issueNumber}`)} - ${wip.title}`)
        this.log(`  ${colors.dim(`Started: ${wip.startedAt}`)}`)
        this.log(`  ${colors.blue(wip.issueUrl)}`)
      }
    }

    if (state.mutedIssues.length) {
      this.log('')
      this.log(colors.bold('Muted Issues'))
      for (const muted of state.mutedIssues) {
        const reason = muted.reason ? colors.dim(` - ${muted.reason}`) : ''
        this.log(`${muted.issueId}${reason}`)
      }
    }
  }
}
