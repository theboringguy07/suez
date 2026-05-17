import {Command} from '@oclif/core'

import {readConfig, writeConfig} from '../config'
import {configFilePath} from '../config/defaults'
import {colors} from '../ui/colors'
import {confirm, promptText} from '../ui/prompts'

export default class Init extends Command {
  static description = 'Create or update the Suez config file.'

  async run(): Promise<void> {
    const existing = await readConfig()

    this.log(colors.bold('Suez setup'))
    const githubToken = await promptText('GitHub bearer token', existing.githubToken)
    const languages = await promptText('Languages, comma separated', existing.languages.join(','))
    const baseDirectory = await promptText('Base clone directory', existing.baseDirectory)
    const autoFork = await confirm('Automatically fork repositories when local setup needs it?', existing.autoFork)

    await writeConfig({
      ...existing,
      githubToken: githubToken.trim(),
      languages: languages
        .split(',')
        .map((language) => language.trim())
        .filter(Boolean),
      baseDirectory: baseDirectory.trim() || existing.baseDirectory,
      autoFork,
    })

    this.log(colors.green(`Config written to ${configFilePath}`))
  }
}
