import {Command} from '@oclif/core'

import {readConfig} from '../../config'
import {colors} from '../../ui/colors'

export default class Repos extends Command {
  static description = 'Show configured repository lists.'

  async run(): Promise<void> {
    const config = await readConfig()
    const listNames = Object.keys(config.repoLists)

    if (!listNames.length) {
      this.log(colors.yellow('No repo lists configured.'))
      this.log(colors.dim('Add one with: suez repos add frontend https://github.com/owner/repo'))
      return
    }

    this.log(colors.bold('Repository Lists'))
    this.log(colors.dim(`Stored in ${Object.keys(config.repoLists).length} list(s).`))
    this.log('')

    for (const name of listNames) {
      const repositories = config.repoLists[name]
      this.log(`${colors.bold(name)} ${colors.dim(`(${repositories.length})`)}`)
      for (const repository of repositories) {
        this.log(`  ${repository}`)
      }
    }
  }
}
