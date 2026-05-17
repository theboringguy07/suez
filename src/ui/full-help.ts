import {colors} from './colors'

type CommandHelp = {
  command: string
  description: string
  flags?: Array<{name: string; description: string}>
  examples?: string[]
}

const commands: CommandHelp[] = [
  {
    command: 'suez init',
    description: 'Create or update your GitHub token, language preferences, clone directory, and setup defaults.',
  },
  {
    command: 'suez config',
    description: 'Show the config file path and current settings with the GitHub token redacted.',
  },
  {
    command: 'suez config set <key> <value>',
    description: 'Update one config value from the terminal.',
    examples: ['suez config set languages TypeScript,JavaScript', 'suez config set autoFork true'],
  },
  {
    command: 'suez config open',
    description: 'Open the config file in your $EDITOR or $VISUAL.',
  },
  {
    command: 'suez repos',
    description: 'View all configured repository lists and the repositories inside each list.',
  },
  {
    command: 'suez repos add <list> <repo>',
    description: 'Add a repository to a named list. Accepts owner/repo or a GitHub URL.',
    examples: ['suez repos add frontend vercel/next.js', 'suez repos add frontend https://github.com/vercel/next.js'],
  },
  {
    command: 'suez repos remove <list> <repo>',
    description: 'Remove a repository from a named list.',
  },
  {
    command: 'suez suggest',
    description: 'Suggest open issues from starred repositories or a repo list, ranked by labels and your recent GitHub activity.',
    flags: [
      {name: '--beginner', description: 'Only show issues labeled good first issue.'},
      {name: '--list <name>', description: 'Use a named repo list instead of starred repositories.'},
      {name: '--repos <number>', description: 'Number of starred repositories to scan. Default: 20.'},
      {name: '--issues <number>', description: 'Number of open issues to read per repository. Default: 5.'},
      {name: '--muted', description: 'Include issues you previously muted.'},
    ],
    examples: ['suez suggest', 'suez suggest --beginner', 'suez suggest --list frontend --issues 10'],
  },
  {
    command: 'suez mute <issue-url>',
    description: 'Hide an issue from future suggestions.',
    flags: [{name: '--reason <text>', description: 'Store a short reason for muting the issue.'}],
  },
  {
    command: 'suez unmute <issue-url>',
    description: 'Allow a muted issue to appear in suggestions again.',
  },
  {
    command: 'suez take <issue-url>',
    description: 'Track a GitHub issue as your active work in progress.',
    flags: [
      {name: '--title <text>', description: 'Store a local title without fetching issue details.'},
      {name: '--comment', description: 'Prompt before posting your configured WIP comment to GitHub.'},
      {name: '--setup', description: 'Clone/update the repository and create a branch for the issue.'},
    ],
    examples: ['suez take https://github.com/owner/repo/issues/123 --comment --setup'],
  },
  {
    command: 'suez status',
    description: 'Show active WIP issues and muted issues tracked locally.',
  },
]

export function printFullHelp(): void {
  console.log(colors.bold('Suez'))
  console.log('CLI open-source contributor toolkit.')
  console.log('')
  console.log(colors.bold('Usage'))
  console.log('  suez <command> [flags]')
  console.log('  suez <command> --help')
  console.log('')
  console.log(colors.bold('Commands'))

  for (const item of commands) {
    console.log(`  ${colors.green(item.command)}`)
    console.log(`    ${item.description}`)

    if (item.flags?.length) {
      console.log(`    ${colors.cyan('Flags')}`)
      for (const flag of item.flags) {
        console.log(`      ${flag.name.padEnd(20)} ${flag.description}`)
      }
    }

    if (item.examples?.length) {
      console.log(`    ${colors.cyan('Examples')}`)
      for (const example of item.examples) {
        console.log(`      ${example}`)
      }
    }

    console.log('')
  }
}
