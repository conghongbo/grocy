import { createClient } from './client'
import { context } from '../app/context'
export interface Task { id: number; name: string; description: string | null; due_date: string | null; done: number; done_time?: string; category_id: number | null; assigned_to_user_id: number | null; userfields?: Record<string, string | null> }
export interface Category { id: number; name: string; description: string | null; active: number; userfields?: Record<string, string | null> }
export interface User { id: number; username: string; display_name?: string }
export interface Field { sort_number?: number; id: number; name: string; caption: string; type: string; config: string; input_required: number; default_value: string; show_as_column_in_tables: number }
export const api = createClient(context.apiBase)
export function rows<T>(value: unknown): T[] {
  if (!Array.isArray(value) || value.some(row => typeof row !== 'object' || !row || !('id' in row))) throw new Error('Invalid Grocy list response')
  return value as T[]
}
export const list = async <T>(entity: string, query = '', signal?: AbortSignal) => rows<T>(await api<unknown>(`objects/${entity}${query}`, { signal }))
export const mutate = <T = void>(path: string, method: string, body: unknown = {}) => api<T>(path, { method, body: JSON.stringify(body) })
