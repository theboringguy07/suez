import {access, mkdir} from 'node:fs/promises'
import {basename, join} from 'node:path'
import {spawn} from 'node:child_process'

import type {IssueSummary, SuezConfig} from '../types'

export async function setupLocalRepository(config: SuezConfig, issue: IssueSummary): Promise<string> {
  await mkdir(config.baseDirectory, {recursive: true})

  const repoDirectory = join(config.baseDirectory, basename(issue.repository.nameWithOwner))
  const exists = await pathExists(repoDirectory)

  if (!exists) {
    await run('git', ['clone', issue.repository.cloneUrl, repoDirectory], process.cwd())
  }

  const branch = formatBranchName(config.branchFormat, issue)
  await run('git', ['fetch', 'origin'], repoDirectory)
  await run('git', ['checkout', issue.repository.defaultBranch], repoDirectory)
  await run('git', ['pull', '--ff-only'], repoDirectory)
  await run('git', ['checkout', '-B', branch], repoDirectory)

  return repoDirectory
}

function formatBranchName(format: string, issue: IssueSummary): string {
  const type = issue.labels.some((label) => label.toLowerCase().includes('bug')) ? 'fix' : 'work'

  return format
    .replaceAll('{type}', type)
    .replaceAll('{number}', String(issue.number))
    .replaceAll('{repo}', issue.repository.nameWithOwner.split('/')[1])
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function run(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {cwd, stdio: 'inherit', shell: true})
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed`))))
  })
}
