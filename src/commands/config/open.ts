import {Command} from '@oclif/core'
import {spawn} from 'node:child_process'

import {readConfig, writeConfig} from '../../config'
import {configFilePath} from '../../config/defaults'

export default class ConfigOpen extends Command {
  static description = 'Open the Suez config in $EDITOR.'

  async run(): Promise<void> {
    await writeConfig(await readConfig())

    const editor = process.env.EDITOR || process.env.VISUAL
    if (!editor) {
      this.log(`EDITOR is not set. Config path: ${configFilePath}`)
      return
    }

    await new Promise<void>((resolve, reject) => {
      const child = spawn(editor, [configFilePath], {stdio: 'inherit', shell: true})
      child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${editor} exited with code ${code}`))))
    })
  }
}
