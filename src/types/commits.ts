export interface CommitData {
  id: string
  message: string
  author: {
    login: string
    avatar_url: string
  }
  timestamp: string
  repo: string
  sha: string
  url: string
}

export interface CommitResponse {
  commits: CommitData[]
  nextPage: number | null
}

