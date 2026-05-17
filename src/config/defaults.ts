import {join} from 'node:path'
import {homedir} from 'node:os'

import type {SuezConfig} from '../types'

export const configDirectory = process.env.SUEZ_HOME || join(homedir(), '.suez')
export const configFilePath = join(configDirectory, 'suezconfig.json')

export const defaultConfig: SuezConfig = {
  githubToken: '',
  languages: [],
  baseDirectory: join(homedir(), 'Code'),
  branchFormat: '{type}/issue-{number}',
  wipCommentTemplate: 'I would like to work on this issue.',
  autoFork: false,
  repoLists: {},
}
