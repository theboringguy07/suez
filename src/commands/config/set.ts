import {Args, Command} from '@oclif/core'

import {readConfig, setConfigValue, writeConfig} from '../../config'

export default class ConfigSet extends Command {
  static description = 'Set a config value.'

  static args = {
    key: Args.string({required: true}),
    value: Args.string({required: true}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(ConfigSet)
    const config = await readConfig()
    const updated = setConfigValue(config, args.key, args.value)

    await writeConfig(updated)
    this.log(`Updated ${args.key}`)
  }
}
