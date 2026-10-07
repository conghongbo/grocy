export class ApiError extends Error {
  readonly kind: 'http' | 'network' | 'invalid-response'
  readonly status: number | null

  constructor(message: string, kind: ApiError['kind'], status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

// Endpoints are suffixes such as /tasks; the Vite proxy owns the /api prefix.
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//') || /^\/api(?:[/?#]|$)/.test(endpoint)) {
    throw new Error('API endpoints must begin with / and exclude the /api prefix.')
  }

  let response: Response
  let body: string
  const headers = new Headers(options?.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  try {
    response = await fetch(`/api${endpoint}`, {
      ...options,
      credentials: 'same-origin',
      headers,
    })
    body = await response.text()
  } catch (error) {
    if (options?.signal?.aborted) throw error
    throw new ApiError('Could not reach Grocy. Check your connection and try again.', 'network')
  }

  const isJson = /\bapplication\/(?:[\w.-]+\+)?json\b/i.test(response.headers.get('content-type') ?? '')
  let data: unknown
  if (isJson) {
    try { data = JSON.parse(body) } catch { /* Report a usable response error below. */ }
  }

  if (!response.ok) {
    const backendMessage = typeof data === 'object' && data !== null &&
      'error_message' in data && typeof data.error_message === 'string'
      ? data.error_message : null
    const message = response.status === 401
      ? 'Sign in to the existing Grocy frontend in this browser, then retry.'
      : backendMessage || 'Grocy could not load the tasks. Please try again.'
    throw new ApiError(`${message} (HTTP ${response.status})`, 'http', response.status)
  }
  if (!isJson || data === undefined) {
    throw new ApiError('Grocy returned an unexpected response. Check that the API is reachable, then retry.', 'invalid-response', response.status)
  }
  return data as T
}
