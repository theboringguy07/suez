import {mkdir, readFile, writeFile} from 'node:fs/promises'

import {configDirectory, configFilePath, defaultConfig} from './defaults'
import type {SuezConfig} from '../types'

export async function readConfig(): Promise<SuezConfig> {
  try {
    const raw = await readFile(configFilePath, 'utf8')
    return {...defaultConfig, ...JSON.parse(raw)}
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultConfig
    }

    throw error
  }
}

export async function writeConfig(config: SuezConfig): Promise<void> {
  await mkdir(configDirectory, {recursive: true})
  await writeFile(configFilePath, JSON.stringify(config, null, 2) + '\n')
}

export function setConfigValue(config: SuezConfig, key: string, value: string): SuezConfig {
  if (!(key in config)) {
    throw new Error(`Unknown config key: ${key}`)
  }

  const current = config[key as keyof SuezConfig]
  const parsed = parseValue(value, current)

  return {
    ...config,
    [key]: parsed,
  }
}

function parseValue(value: string, current: SuezConfig[keyof SuezConfig]): SuezConfig[keyof SuezConfig] {
  if (typeof current === 'boolean') {
    return value === 'true'
  }

  if (Array.isArray(current)) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof current === 'object') {
    return JSON.parse(value)
  }

  return value
}
