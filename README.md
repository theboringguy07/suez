# Suez

Suez is an oclif + TypeScript CLI for finding and tracking open-source issues from GitHub.

## Setup

```sh
npm install
npm run build
node ./bin/run.js --help
```

Install the published package globally:

```sh
npm install -g @theboringguy07/suez
suez --help
```

During development, set `SUEZ_HOME` if you want config and WIP state to stay inside the project:

```sh
$env:SUEZ_HOME = "$PWD/.tmp-suez"
```

## Commands

```sh
suez init
suez config
suez config set languages TypeScript,JavaScript
suez config open
suez repos add frontend vercel/next.js
suez repos add frontend https://github.com/vercel/next.js
suez repos
suez suggest --beginner
suez suggest --list frontend
suez mute https://github.com/owner/repo/issues/123 --reason "not relevant"
suez take https://github.com/owner/repo/issues/123 --title "Issue title"
suez take https://github.com/owner/repo/issues/123 --comment --setup
suez status
```

`suez suggest` ranks issues with small/medium/large labels and labels that match your recent GitHub pull requests and issues. Muted issues are hidden unless you pass `--muted`.

## Structure

- `src/commands`: oclif command entrypoints.
- `src/config`: config defaults, read/write, and simple updates.
- `src/github`: GitHub GraphQL client and issue queries.
- `src/state`: local WIP state storage.
- `src/utils`: small shared helpers.
