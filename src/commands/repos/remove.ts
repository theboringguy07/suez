import {Args, Command} from '@oclif/core'

import {readConfig, writeConfig} from '../../config'
import {colors} from '../../ui/colors'

export default class ReposRemove extends Command {
  static description = 'Remove a repository from a named repo list.'

  static args = {
    list: Args.string({required: true}),
    repository: Args.string({description: 'Repository in owner/name format', required: true}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(ReposRemove)
    const config = await readConfig()
    const repositories = config.repoLists[args.list] || []

    await writeConfig({
      ...config,
      repoLists: {
        ...config.repoLists,
        [args.list]: repositories.filter((repository) => repository !== args.repository),
      },
    })

    this.log(colors.green(`Removed ${args.repository} from ${args.list}`))
  }
}
