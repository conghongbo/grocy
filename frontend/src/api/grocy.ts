import { apiRequest, post } from './client'
export type Id = number | string
export interface Named { id: Id; name: string; active?: number | string }
export interface Product extends Named { location_id: Id; qu_id_stock: Id }
export interface Stock { product_id: Id; product: Product; amount: number | string; amount_opened: number | string; best_before_date: string | null }
export interface Task extends Named { due_date: string | null; done: number | string; category?: Named; assigned_to_user?: { username: string } }
export interface Chore { chore_id: Id; chore_name: string; last_tracked_time: string | null; next_estimated_execution_time: string | null; next_execution_assigned_user?: { username: string } }
export interface Battery { battery_id: Id; battery: Named & { rechargeable: number | string }; last_tracked_time: string | null; next_estimated_charge_time: string | null; charge_cycles_count: number }
export interface Execution { id: Id }
export const grocy = {
  stock: (signal?: AbortSignal) => apiRequest<Stock[]>('/stock', { signal }),
  products: (signal?: AbortSignal) => apiRequest<Product[]>('/objects/products', { signal }),
  tasks: (signal?: AbortSignal) => apiRequest<Task[]>('/tasks', { signal }),
  chores: (signal?: AbortSignal) => apiRequest<Chore[]>('/chores', { signal }),
  batteries: (signal?: AbortSignal) => apiRequest<Battery[]>('/batteries', { signal }),
  objects: (entity: string, signal?: AbortSignal) => apiRequest<Named[]>(`/objects/${entity}`, { signal }),
  stockAction: (id: Id, action: 'consume' | 'open' | 'add' | 'inventory', body: unknown) => post(`/stock/products/${id}/${action}`, body),
  complete: (id: Id) => post<void>(`/tasks/${id}/complete`),
  undoTask: (id: Id) => post<void>(`/tasks/${id}/undo`),
  execute: (id: Id, body: unknown) => post<Execution>(`/chores/${id}/execute`, body),
  undoChore: (id: Id) => post<void>(`/chores/executions/${id}/undo`),
  charge: (id: Id, body: unknown) => post<Execution>(`/batteries/${id}/charge`, body),
  undoCharge: (id: Id) => post<void>(`/batteries/charge-cycles/${id}/undo`),
}
