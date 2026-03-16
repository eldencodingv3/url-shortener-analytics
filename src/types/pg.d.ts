declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string
    ssl?: boolean | { rejectUnauthorized?: boolean }
  }

  export interface QueryResult<T = Record<string, unknown>> {
    rows: T[]
    rowCount: number | null
  }

  export interface PoolClient {
    query(text: string, values?: unknown[]): Promise<QueryResult>
    release(): void
  }

  export class Pool {
    constructor(config?: PoolConfig)
    query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<T>>
    connect(): Promise<PoolClient>
    end(): Promise<void>
  }
}
