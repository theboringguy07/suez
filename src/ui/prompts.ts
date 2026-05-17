import {createInterface} from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'

import {colors} from './colors'

export async function promptText(message: string, fallback = ''): Promise<string> {
  const prompt = createInterface({input, output})
  const suffix = fallback ? colors.dim(` (${fallback})`) : ''
  const answer = await prompt.question(`${colors.cyan('?')} ${message}${suffix}: `)
  prompt.close()

  return answer.trim() || fallback
}

export async function confirm(message: string, defaultValue = true): Promise<boolean> {
  const prompt = createInterface({input, output})
  const suffix = defaultValue ? 'Y/n' : 'y/N'
  const answer = await prompt.question(`${colors.cyan('?')} ${message} ${colors.dim(`(${suffix})`)} `)
  prompt.close()

  if (!answer.trim()) {
    return defaultValue
  }

  return ['y', 'yes'].includes(answer.trim().toLowerCase())
}
