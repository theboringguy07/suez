import {Args, Command} from '@oclif/core'

import {readConfig, writeConfig} from '../../config'
import {colors} from '../../ui/colors'
import {parseRepositoryInput} from '../../utils/github-url'

export default class ReposAdd extends Command {
  static description = 'Add a repository to a named repo list.'

  static args = {
    list: Args.string({required: true}),
    repository: Args.string({description: 'Repository as owner/name or a GitHub URL', required: true}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(ReposAdd)
    const repository = parseRepositoryInput(args.repository)

    const config = await readConfig()
    const repositories = new Set(config.repoLists[args.list] || [])
    repositories.add(repository)

    await writeConfig({
      ...config,
      repoLists: {
        ...config.repoLists,
        [args.list]: [...repositories].sort(),
      },
    })

    this.log(colors.green(`Added ${repository} to ${args.list}`))
  }
}
