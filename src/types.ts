export type SuezConfig = {
  githubToken: string
  languages: string[]
  baseDirectory: string
  branchFormat: string
  wipCommentTemplate: string
  autoFork: boolean
  repoLists: Record<string, string[]>
}

export type IssueSummary = {
  id: string
  number: number
  title: string
  url: string
  labels: string[]
  score: number
  scoreReasons: string[]
  size?: 'small' | 'medium' | 'large'
  repository: {
    nameWithOwner: string
    primaryLanguage?: string
    url: string
    cloneUrl: string
    defaultBranch: string
  }
}

export type WipIssue = {
  issueId: string
  issueNumber: number
  issueUrl: string
  title: string
  repository: string
  startedAt: string
  status: 'active' | 'completed' | 'dropped'
}

export type MutedIssue = {
  issueId: string
  issueUrl: string
  mutedAt: string
  reason?: string
}

export type SuezState = {
  wips: WipIssue[]
  mutedIssues: MutedIssue[]
}
