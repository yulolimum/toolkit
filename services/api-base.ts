import type { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios'

import axios from 'axios'

const defaultErrorMessage = 'An error occurred while processing the request.'

export type ApiBaseOptions = Readonly<{
  config?: CreateAxiosDefaults
}>

export type ApiErrorResponse = Record<string, unknown> & {
  error: string
}

export type ApiResult<Data> = { ok: true; data: Data } | { ok: false; data: ApiErrorResponse }

/**
 * Base class for Axios-backed API clients.
 *
 * It creates an Axios client with JSON defaults and turns every HTTP response
 * into a discriminated result. Expected API failures therefore stay in normal
 * control flow, while `unsafe` lets a caller opt into throwing the normalized
 * error response.
 *
 * @example
 * ```ts
 * class Api extends ApiBase {
 *   getProfile() {
 *     return this.processResponse(this.client.get<Profile>('/profile'))
 *   }
 * }
 *
 * const api = new Api({ config: { baseURL: 'https://api.example.com' } })
 * const result = await api.getProfile()
 *
 * if (result.ok) {
 *   console.log(result.data)
 * }
 * ```
 */
export class ApiBase {
  client: AxiosInstance
  readonly initialConfig: CreateAxiosDefaults

  constructor(options?: ApiBaseOptions) {
    this.initialConfig = this.mergeConfig(options?.config ?? {})
    this.client = axios.create(this.initialConfig)
  }

  /**
   * Replaces the client with a new instance.
   * Omit `config` to recreate the client from its initial configuration.
   */
  reinitialize(config?: CreateAxiosDefaults) {
    this.client = axios.create(this.mergeConfig(config ?? this.initialConfig))
  }

  /**
   * Replaces the client with its initial configuration, removing runtime-only
   * base-URL and header changes.
   */
  reset() {
    this.client = axios.create(this.initialConfig)
  }

  /**
   * Changes the current client's base URL without changing the reset target.
   */
  setBaseURL(baseURL: string | undefined) {
    this.client.defaults.baseURL = baseURL
  }

  /**
   * Adds, changes, or removes a header on the current client.
   * Pass `null` or `undefined` to remove it.
   */
  setHeader(name: string, value: string | number | boolean | null | undefined) {
    if (value === null || value === undefined) {
      delete this.client.defaults.headers.common[name]
      return
    }

    this.client.defaults.headers.common[name] = value
  }

  /**
   * Sets a Bearer authorization header, or removes it when the token is empty.
   */
  setAuthorizationHeader(token: string | null | undefined) {
    this.setHeader('Authorization', token ? `Bearer ${token}` : undefined)
  }

  /**
   * Sets a Cookie header, or removes it when no cookie is supplied.
   */
  setCookieHeader(cookie: string | null | undefined) {
    this.setHeader('Cookie', cookie || undefined)
  }

  /**
   * Resolves an Axios request into an `ApiResult`.
   * HTTP responses outside the 2xx range return `ok: false`; network and
   * interceptor failures return a default error response.
   */
  async processResponse<Data>(request: Promise<AxiosResponse<Data>>): Promise<ApiResult<Data>> {
    try {
      const response = await request

      if (response.status >= 200 && response.status < 300) {
        return { ok: true, data: response.data }
      }

      return { ok: false, data: createApiError(response.data) }
    } catch {
      return { ok: false, data: { error: defaultErrorMessage } }
    }
  }

  /**
   * Returns successful data or throws the normalized API error response.
   * Use it at boundaries where thrown errors are the desired control flow.
   */
  async unsafe<Data>(request: Promise<ApiResult<Data>>): Promise<Data> {
    const result = await request

    if (result.ok) {
      return result.data
    }

    throw result.data
  }

  protected mergeConfig(config: CreateAxiosDefaults): CreateAxiosDefaults {
    return {
      timeout: 45_000,
      validateStatus: () => true,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    }
  }
}

function createApiError(data: unknown): ApiErrorResponse {
  if (!isRecord(data)) {
    return { error: typeof data === 'string' ? data : defaultErrorMessage }
  }

  return {
    ...data,
    error: typeof data.error === 'string' ? data.error : defaultErrorMessage,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
