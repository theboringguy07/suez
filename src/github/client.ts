export type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{message: string}>
}

export class GitHubClient {
  constructor(private readonly token: string) {}

  async graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    if (!this.token) {
      throw new Error('GitHub token is missing. Run `suez init` first.')
    }

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.token}`,
        'content-type': 'application/json',
        'user-agent': 'suez-cli',
      },
      body: JSON.stringify({query, variables}),
    })

    const body = (await response.json()) as GraphqlResponse<T>

    if (!response.ok || body.errors?.length) {
      const message = body.errors?.map((error) => error.message).join(', ') || response.statusText
      throw new Error(`GitHub GraphQL request failed: ${message}`)
    }

    if (!body.data) {
      throw new Error('GitHub GraphQL response did not include data.')
    }

    return body.data
  }
}
