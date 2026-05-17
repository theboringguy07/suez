export function parseIssueUrl(url: string): {owner: string; repo: string; number: number; repository: string} {
  const parsed = new URL(url)
  const [, owner, repo, type, number] = parsed.pathname.split('/')

  if (parsed.hostname !== 'github.com' || !owner || !repo || type !== 'issues' || !number) {
    throw new Error('Expected a GitHub issue URL like https://github.com/owner/repo/issues/123')
  }

  return {
    owner,
    repo,
    number: Number(number),
    repository: `${owner}/${repo}`,
  }
}

export function parseRepositoryInput(input: string): string {
  const trimmed = input.trim()

  if (/^[^/\s]+\/[^/\s]+$/.test(trimmed)) {
    return trimmed.replace(/\.git$/, '')
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Repository must be owner/name or a GitHub repo URL.')
  }

  const [, owner, repo] = parsed.pathname.split('/')
  const normalizedRepo = repo?.replace(/\.git$/, '')

  if (parsed.hostname !== 'github.com' || !owner || !normalizedRepo) {
    throw new Error('Repository URL must look like https://github.com/owner/repo')
  }

  return `${owner}/${normalizedRepo}`
}
