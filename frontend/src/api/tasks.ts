import { apiRequest } from './client.ts'
import { decodeTasks } from '../features/tasks/taskModel.ts'
import type { Task } from '../types/tasks.ts'

export async function getCurrentTasks(signal?: AbortSignal): Promise<Task[]> {
  return decodeTasks(await apiRequest<unknown>('/tasks', { method: 'GET', signal }))
}
