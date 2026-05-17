import type {IssueSummary} from '../types'
import {getIssueSize} from '../utils/labels'
import {GitHubClient} from './client'

type IssueDetailsResponse = {
  repository: {
    nameWithOwner: string
    url: string
    defaultBranchRef: {name: string} | null
    primaryLanguage: {name: string} | null
    issue: {
      id: string
      number: number
      title: string
      url: string
      labels: {nodes: Array<{name: string}>} | null
    } | null
  } | null
}

type AddCommentResponse = {
  addComment: {
    commentEdge: {
      node: {
        url: string
      }
    } | null
  } | null
}

const issueDetailsQuery = `
  query IssueDetails($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      nameWithOwner
      url
      defaultBranchRef {
        name
      }
      primaryLanguage {
        name
      }
      issue(number: $number) {
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
`

const addCommentMutation = `
  mutation AddIssueComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      commentEdge {
        node {
          url
        }
      }
    }
  }
`

export async function getIssueDetails(
  token: string,
  issue: {owner: string; repo: string; number: number},
): Promise<IssueSummary> {
  const client = new GitHubClient(token)
  const data = await client.graphql<IssueDetailsResponse>(issueDetailsQuery, issue)

  if (!data.repository?.issue) {
    throw new Error('GitHub issue was not found.')
  }

  const labels = data.repository.issue.labels?.nodes.map((label) => label.name) || []

  return {
    id: data.repository.issue.id,
    number: data.repository.issue.number,
    title: data.repository.issue.title,
    url: data.repository.issue.url,
    labels,
    score: 0,
    scoreReasons: [],
    size: getIssueSize(labels),
    repository: {
      nameWithOwner: data.repository.nameWithOwner,
      primaryLanguage: data.repository.primaryLanguage?.name,
      url: data.repository.url,
      cloneUrl: `${data.repository.url}.git`,
      defaultBranch: data.repository.defaultBranchRef?.name || 'main',
    },
  }
}

export async function addIssueComment(token: string, issueId: string, body: string): Promise<string | undefined> {
  const client = new GitHubClient(token)
  const data = await client.graphql<AddCommentResponse>(addCommentMutation, {
    subjectId: issueId,
    body,
  })

  return data.addComment?.commentEdge?.node.url
}
