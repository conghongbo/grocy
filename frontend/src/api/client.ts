export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}
export function createClient(base: string, transport: typeof fetch = fetch) {
  return async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await transport(`${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`, {
      ...options, credentials: 'same-origin',
      headers: { ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    })
    if (response.redirected && /\/login(?:\?|$)/.test(response.url)) throw new ApiError(401, 'Grocy session expired; sign in again')
    const text = response.status === 204 ? '' : await response.text()
    let data: unknown
    try { data = text ? JSON.parse(text) : undefined } catch { if (response.ok) throw new ApiError(response.status, 'Invalid JSON response') }
    if (!response.ok) throw new ApiError(response.status, typeof data === 'object' && data && 'error_message' in data ? String(data.error_message) : `Grocy API request failed: ${response.status}`)
    return data as T
  }
}
