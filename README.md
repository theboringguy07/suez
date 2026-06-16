# Suez

Suez is a TypeScript CLI for open-source contributors who want a faster answer to: "What should I work on next?"

It searches your starred GitHub repositories or curated repository lists, recommends open issues, lets you mute irrelevant work, tracks active WIP issues locally, and can optionally prepare a local Git branch for an issue.

## Features

- Discover open issues from starred GitHub repositories.
- Maintain named repository lists such as `frontend`, `backend`, or `cli-tools`.
- Suggest beginner-friendly issues with `--beginner`.
- Rank issues using size labels and labels from your recent GitHub PRs/issues.
- Mute issues you do not want to see again.
- Track active work-in-progress issues locally.
- Optionally post a WIP comment to GitHub when taking an issue.
- Optionally clone/update the repository and create a branch for the issue.
- Store configuration and local state outside the project directory by default.

## Requirements

- Node.js `>=18`
- npm
- Git, only required for `suez take --setup`
- A GitHub personal access token for GitHub GraphQL API calls

For public open-source work, a classic GitHub token with `public_repo` is usually enough. If you want to work with private repositories, use a token with the needed `repo` access.

## Installation

Install from npm:

```sh
npm install -g @theboringguy07/suez
```

Check that the CLI is available:

```sh
suez
```

Running `suez` with no command prints a command and flag reference.

## Quick Start

1. Initialize Suez:

```sh
suez init
```

You will be prompted for:

- GitHub bearer token
- Preferred languages
- Base clone directory
- Whether Suez should auto-fork when setup needs it

2. Add curated repository lists:

```sh
suez repos add frontend https://github.com/vercel/next.js
suez repos add cli-tools oclif/core
```

3. View your lists:

```sh
suez repos
```

4. Suggest issues:

```sh
suez suggest
suez suggest --beginner
suez suggest --list frontend
```

5. Take an issue:

```sh
suez take https://github.com/owner/repo/issues/123
```

6. Check active work:

```sh
suez status
```

## Configuration And State

By default, Suez stores files in:

```text
~/.suez
```

On Windows this is usually:

```text
C:\Users\<you>\.suez
```

The main config file is:

```text
~/.suez/suezconfig.json
```

It stores:

```json
{
  "githubToken": "",
  "languages": ["TypeScript"],
  "baseDirectory": "~/Code",
  "branchFormat": "{type}/issue-{number}",
  "wipCommentTemplate": "I would like to work on this issue.",
  "autoFork": false,
  "repoLists": {
    "frontend": ["vercel/next.js"]
  }
}
```

Local WIP and mute state are stored in:

```text
~/.suez/wip.json
```

For development or testing, set `SUEZ_HOME` to keep config and state inside the project:

PowerShell:

```powershell
$env:SUEZ_HOME = "$PWD\.tmp-suez"
```

macOS/Linux:

```sh
export SUEZ_HOME="$PWD/.tmp-suez"
```

## Commands

### `suez`

Prints the full command reference, including available flags and examples.

```sh
suez
```

### `suez init`

Creates or updates the Suez config file.

```sh
suez init
```

Use this first so Suez can call the GitHub GraphQL API.

### `suez config`

Prints the config path and current settings. The GitHub token is redacted.

```sh
suez config
```

### `suez config set <key> <value>`

Updates a config value.

```sh
suez config set languages TypeScript,JavaScript
suez config set autoFork true
suez config set branchFormat "{type}/issue-{number}"
```

Arrays are passed as comma-separated values. Object values, such as `repoLists`, should be valid JSON if set directly, though `suez repos add` is preferred for repo lists.

### `suez config open`

Opens the config file in `$EDITOR` or `$VISUAL`.

```sh
suez config open
```

If no editor environment variable is set, Suez prints the config path.

### `suez repos`

Shows all configured repository lists.

```sh
suez repos
```

Example output:

```text
Repository Lists
Stored in 2 list(s).

frontend (1)
  vercel/next.js
cli-tools (1)
  oclif/core
```

### `suez repos add <list> <repo>`

Adds a repository to a named list.

The repository can be passed as `owner/repo`:

```sh
suez repos add frontend vercel/next.js
```

Or as a full GitHub URL:

```sh
suez repos add frontend https://github.com/vercel/next.js
```

Suez stores both forms as:

```text
vercel/next.js
```

### `suez repos remove <list> <repo>`

Removes a repository from a named list.

```sh
suez repos remove frontend vercel/next.js
```

### `suez suggest`

Suggests open issues from your starred repositories.

```sh
suez suggest
```

Useful flags:

```sh
suez suggest --beginner
suez suggest --repos 50
suez suggest --issues 10
suez suggest --muted
```

Flags:

- `--beginner`: only request issues labeled `good first issue`.
- `--repos <number>`: number of starred repositories to scan. Default: `20`.
- `--issues <number>`: number of open issues to read per repository. Default: `5`.
- `--muted`: include issues you previously muted.

### `suez suggest --list <name>`

Suggests issues from a curated repo list instead of starred repositories.

```sh
suez suggest --list frontend
suez suggest --list frontend --beginner
suez suggest --list frontend --issues 10
```

This is useful when you star many repositories but only want recommendations from a smaller active contribution pool.

### How Suggestion Ranking Works

Suez uses GitHub GraphQL to fetch:

- open issues from starred repositories or a named list
- repository language
- issue labels
- your recent PR and issue labels

It then scores issues locally.

Positive signals include:

- `good first issue`
- `easy`
- `beginner`
- `size: small`
- labels that match labels from your recent GitHub activity

Negative signals include:

- `size: large`
- `large`
- `epic`

If `languages` is configured, Suez hides repositories whose primary language is not in your language list.

### `suez mute <issue-url>`

Hides an issue from future suggestions.

```sh
suez mute https://github.com/owner/repo/issues/123
```

Add a reason:

```sh
suez mute https://github.com/owner/repo/issues/123 --reason "not relevant"
```

Muted issues are stored locally and are hidden unless you pass:

```sh
suez suggest --muted
```

### `suez unmute <issue-url>`

Allows a muted issue to appear in suggestions again.

```sh
suez unmute https://github.com/owner/repo/issues/123
```

### `suez take <issue-url>`

Tracks an issue as active work in progress.

```sh
suez take https://github.com/owner/repo/issues/123
```

Suez enforces one active WIP per repository. If you already have an active issue for a repository, taking another issue from the same repository will fail.

Useful flags:

```sh
suez take https://github.com/owner/repo/issues/123 --title "Fix config loading"
suez take https://github.com/owner/repo/issues/123 --comment
suez take https://github.com/owner/repo/issues/123 --setup
suez take https://github.com/owner/repo/issues/123 --comment --setup
```

Flags:

- `--title <text>`: store a local title without relying on fetched issue details.
- `--comment`: prompt before posting your configured WIP comment to GitHub.
- `--setup`: clone/update the repository and create an issue branch.

### Local Setup Workflow

When you run:

```sh
suez take https://github.com/owner/repo/issues/123 --setup
```

Suez:

1. Reads the issue details from GitHub.
2. Creates `baseDirectory` if it does not exist.
3. Clones the repository if it is not already present.
4. Fetches `origin`.
5. Checks out the repository default branch.
6. Pulls latest changes with `--ff-only`.
7. Creates or resets a local issue branch.
8. Tracks the issue as active WIP.

The branch name is built from `branchFormat`.

Default:

```text
{type}/issue-{number}
```

For a non-bug issue `#123`, this becomes:

```text
work/issue-123
```

For a bug-labeled issue, this becomes:

```text
fix/issue-123
```

Supported branch tokens:

- `{type}`: `fix` for bug-labeled issues, otherwise `work`
- `{number}`: issue number
- `{repo}`: repository name

### `suez status`

Shows locally tracked active WIP issues and muted issues.

```sh
suez status
```

## Typical Workflows

### Browse From Starred Repositories

```sh
suez init
suez suggest --beginner
suez take https://github.com/owner/repo/issues/123 --comment --setup
suez status
```

### Browse From A Curated List

```sh
suez repos add frontend https://github.com/vercel/next.js
suez repos add frontend https://github.com/remix-run/remix
suez suggest --list frontend --issues 10
```

### Ignore Noisy Issues

```sh
suez mute https://github.com/owner/repo/issues/123 --reason "too large"
suez suggest
suez suggest --muted
suez unmute https://github.com/owner/repo/issues/123
```

### Claim Without Local Setup

```sh
suez take https://github.com/owner/repo/issues/123 --comment
```

### Claim And Prepare A Branch

```sh
suez take https://github.com/owner/repo/issues/123 --comment --setup
```

## Development

Clone the repository:

```sh
git clone https://github.com/theboringguy07/suez.git
cd suez
```

Install dependencies:

```sh
npm install
```

Build:

```sh
npm run build
```

Run the CLI directly:

```sh
node ./bin/run.js
node ./bin/run.js suggest --help
```

Run through npm:

```sh
npm start
```

Link locally as `suez`:

```sh
npm link
suez
```

Unlink when finished:

```sh
npm unlink -g @theboringguy07/suez
```

Use a local config directory while developing:

```sh
export SUEZ_HOME="$PWD/.tmp-suez"
```

PowerShell:

```powershell
$env:SUEZ_HOME = "$PWD\.tmp-suez"
```

## Project Structure

```text
bin/
  run.js              CLI entrypoint
src/
  commands/           oclif commands
  config/             config defaults, read/write helpers
  git/                local repository setup
  github/             GitHub GraphQL client and queries
  state/              local WIP and mute state
  ui/                 colors, prompts, full help
  utils/              URL and label helpers
.github/workflows/    GitHub Actions workflows
```

## Contributing

Contributions are welcome. Keep changes small, readable, and aligned with the current CLI structure.

### Before Opening A PR

1. Install dependencies:

```sh
npm install
```

2. Build the project:

```sh
npm run build
```

3. Test the command you changed:

```sh
node ./bin/run.js <command> --help
```

4. If your change touches config or state, test with `SUEZ_HOME`:

```sh
export SUEZ_HOME="$PWD/.tmp-suez"
```

5. Avoid committing generated or local files:

- `node_modules/`
- `dist/`
- `.tmp-suez/`
- `*.tgz`
- `.env`

### Code Guidelines

- Keep command files thin.
- Put reusable logic in `src/config`, `src/github`, `src/git`, `src/state`, or `src/utils`.
- Prefer GitHub GraphQL for GitHub data.
- Keep prompts explicit and non-destructive.
- Do not store secrets in source code.
- Keep TypeScript strict and readable.

### Adding A Command

1. Add a new command file under `src/commands`.
2. Keep argument and flag definitions close to the command.
3. Move reusable behavior into a helper module.
4. Run:

```sh
npm run build
node ./bin/run.js
node ./bin/run.js <command> --help
```

## Publishing

Publishing is handled by GitHub Actions through:

```text
.github/workflows/publish.yml
```

The workflow runs when a Git tag matching `v*` is pushed.

### npm Token Setup

In GitHub:

```text
Settings -> Secrets and variables -> Actions
```

Add:

```text
NPM_TOKEN
```

Use an npm automation or granular token that can publish `@theboringguy07/suez` without prompting for an OTP.

### Release Flow

For a patch release:

```sh
npm version patch
git push
git push --tags
```

For a minor release:

```sh
npm version minor
git push
git push --tags
```

The pushed tag triggers the publish workflow.

Verify the published version:

```sh
npm view @theboringguy07/suez version
```

Install the latest published package:

```sh
npm install -g @theboringguy07/suez@latest
suez
```

## Troubleshooting

### `GitHub token is missing`

Run:

```sh
suez init
```

### `suez` command is not found

If using the npm package:

```sh
npm install -g @theboringguy07/suez
```

If developing locally:

```sh
npm link
```

### `npm publish` fails with `EOTP`

npm requires two-factor authentication. For GitHub Actions, update `NPM_TOKEN` to an npm automation or granular token that can publish without an interactive OTP prompt.

### `npm publish` says the version already exists

npm does not allow publishing the same version twice. Bump the version:

```sh
npm version patch
git push
git push --tags
```

### Git warns about dubious ownership

On Windows, if Git reports repository ownership issues, run:

```sh
git config --global --add safe.directory D:/Personal-Proj/suez
```

## License

MIT
