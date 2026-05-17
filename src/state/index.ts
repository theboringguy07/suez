import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

import {configDirectory} from '../config/defaults'
import type {MutedIssue, SuezState, WipIssue} from '../types'

const stateFilePath = join(configDirectory, 'wip.json')

const emptyState: SuezState = {
  wips: [],
  mutedIssues: [],
}

export async function readState(): Promise<SuezState> {
  try {
    const raw = await readFile(stateFilePath, 'utf8')
    const parsed = JSON.parse(raw) as SuezState | WipIssue[]

    if (Array.isArray(parsed)) {
      return {...emptyState, wips: parsed}
    }

    return {
      wips: parsed.wips || [],
      mutedIssues: parsed.mutedIssues || [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return emptyState
    }

    throw error
  }
}

export async function readWips(): Promise<WipIssue[]> {
  return (await readState()).wips
}

export async function writeState(state: SuezState): Promise<void> {
  await mkdir(configDirectory, {recursive: true})
  await writeFile(stateFilePath, JSON.stringify(state, null, 2) + '\n')
}

export async function writeWips(wips: WipIssue[]): Promise<void> {
  const state = await readState()
  await writeState({...state, wips})
}

export function findActiveWipForRepo(wips: WipIssue[], repository: string): WipIssue | undefined {
  return wips.find((wip) => wip.repository === repository && wip.status === 'active')
}

export function isMuted(mutedIssues: MutedIssue[], issueIdOrUrl: string): boolean {
  return mutedIssues.some((issue) => issue.issueId === issueIdOrUrl || issue.issueUrl === issueIdOrUrl)
}
