import type {IssueSummary, SuezConfig} from '../types'
import {getIssueSize, scoreIssue} from '../utils/labels'
import {GitHubClient} from './client'

type StarredIssuesResponse = {
  viewer: {
    starredRepositories: {
      nodes: Array<{
        nameWithOwner: string
        url: string
        defaultBranchRef: {name: string} | null
        primaryLanguage: {name: string} | null
        issues: {
          nodes: Array<{
            id: string
            number: number
            title: string
            url: string
            labels: {
              nodes: Array<{name: string}>
            } | null
          }>
        }
      }>
    }
  }
}

type RepositoryIssuesResponse = {
  repository: StarredIssuesResponse['viewer']['starredRepositories']['nodes'][number] | null
}

type HistoricalLabelsResponse = {
  viewer: {
    pullRequests: {
      nodes: Array<{labels: {nodes: Array<{name: string}>} | null}>
    }
    issues: {
      nodes: Array<{labels: {nodes: Array<{name: string}>} | null}>
    }
  }
}

const starredIssuesQuery = `
  query StarredIssues($repoLimit: Int!, $issueLimit: Int!, $labelNames: [String!]) {
    viewer {
      starredRepositories(first: $repoLimit, orderBy: {field: STARRED_AT, direction: DESC}) {
        nodes {
          nameWithOwner
          url
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
          }
          issues(first: $issueLimit, states: OPEN, labels: $labelNames, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              id
              number
              title
              url
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

const repositoryIssuesQuery = `
  query RepositoryIssues($owner: String!, $repo: String!, $issueLimit: Int!, $labelNames: [String!]) {
    repository(owner: $owner, name: $repo) {
      nameWithOwner
      url
      defaultBranchRef {
        name
      }
      primaryLanguage {
        name
      }
      issues(first: $issueLimit, states: OPEN, labels: $labelNames, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          number
          title
          url
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`

const historicalLabelsQuery = `
  query HistoricalLabels($limit: Int!) {
    viewer {
      pullRequests(first: $limit, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
      issues(first: $limit, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`

export async function getSuggestedIssues(
  config: SuezConfig,
  options: {beginner: boolean; repoLimit: number; issueLimit: number; repoList?: string},
): Promise<IssueSummary[]> {
  const client = new GitHubClient(config.githubToken)
  const labelNames = options.beginner ? ['good first issue'] : null
  const historicalLabelWeights = await getHistoricalLabelWeights(client)

  const repositories = options.repoList
    ? await getRepoListIssues(client, config.repoLists[options.repoList] || [], options.issueLimit, labelNames)
    : await getStarredIssues(client, options.repoLimit, options.issueLimit, labelNames)

  return repositories
    .flatMap((repository) => {
      const language = repository.primaryLanguage?.name

      if (config.languages.length && (!language || !config.languages.includes(language))) {
        return []
      }

      return repository.issues.nodes.map((issue) => {
        const labels = issue.labels?.nodes.map((label) => label.name) || []
        const score = scoreIssue(labels, historicalLabelWeights)

        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          url: issue.url,
          labels,
          score: score.score,
          scoreReasons: score.reasons,
          size: getIssueSize(labels),
          repository: {
            nameWithOwner: repository.nameWithOwner,
            primaryLanguage: language,
            url: repository.url,
            cloneUrl: `${repository.url}.git`,
            defaultBranch: repository.defaultBranchRef?.name || 'main',
          },
        }
      })
    })
    .sort((left, right) => right.score - left.score)
}

async function getStarredIssues(
  client: GitHubClient,
  repoLimit: number,
  issueLimit: number,
  labelNames: string[] | null,
): Promise<StarredIssuesResponse['viewer']['starredRepositories']['nodes']> {
  const data = await client.graphql<StarredIssuesResponse>(starredIssuesQuery, {
    repoLimit,
    issueLimit,
    labelNames,
  })

  return data.viewer.starredRepositories.nodes
}

async function getRepoListIssues(
  client: GitHubClient,
  repositories: string[],
  issueLimit: number,
  labelNames: string[] | null,
): Promise<StarredIssuesResponse['viewer']['starredRepositories']['nodes']> {
  const results = await Promise.all(
    repositories.map(async (repository) => {
      const [owner, repo] = repository.split('/')

      if (!owner || !repo) {
        return null
      }

      const data = await client.graphql<RepositoryIssuesResponse>(repositoryIssuesQuery, {
        owner,
        repo,
        issueLimit,
        labelNames,
      })

      return data.repository
    }),
  )

  return results.filter((repository): repository is NonNullable<typeof repository> => Boolean(repository))
}

async function getHistoricalLabelWeights(client: GitHubClient): Promise<Map<string, number>> {
  const weights = new Map<string, number>()
  const data = await client.graphql<HistoricalLabelsResponse>(historicalLabelsQuery, {limit: 20})
  const items = [...data.viewer.pullRequests.nodes, ...data.viewer.issues.nodes]

  for (const item of items) {
    for (const label of item.labels?.nodes || []) {
      const key = label.name.toLowerCase()
      weights.set(key, (weights.get(key) || 0) + 1)
    }
  }

  return weights
}
