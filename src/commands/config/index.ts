import {Command} from '@oclif/core'

import {readConfig} from '../../config'
import {configFilePath} from '../../config/defaults'

export default class Config extends Command {
  static description = 'Show the Suez config file path and current settings.'

  async run(): Promise<void> {
    const config = await readConfig()
    const redacted = {...config, githubToken: config.githubToken ? '[redacted]' : ''}

    this.log(`Path: ${configFilePath}`)
    this.log(JSON.stringify(redacted, null, 2))
  }
}
