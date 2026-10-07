import { ApiError } from '../../api/client.ts'
import type { Task } from '../../types/tasks.ts'

function invalidTasks(): never {
  throw new ApiError('Grocy returned an unexpected task list. Please retry.', 'invalid-response')
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return invalidTasks()
  return value as Record<string, unknown>
}

function id(value: unknown): number {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) return invalidTasks()
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number <= 0) return invalidTasks()
  return number
}

function optionalId(value: unknown): number | null {
  // The legacy service uses empty() to distinguish an unassigned relation.
  return value == null || value === '' || value === 0 || value === '0' ? null : id(value)
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function relation(value: unknown): Record<string, unknown> {
  // Missing/deleted/inactive relations have no usable object; keep the row.
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

export function decodeTasks(payload: unknown): Task[] {
  if (!Array.isArray(payload)) return invalidTasks()
  const seen = new Set<number>()
  return payload.map((value) => {
    const row = object(value)
    const taskId = id(row.id)
    if (seen.has(taskId) || typeof row.name !== 'string' || (row.done !== 0 && row.done !== '0')) return invalidTasks()
    seen.add(taskId)
    if (row.due_date != null && typeof row.due_date !== 'string') return invalidTasks()
    const user = relation(row.assigned_to_user)
    const personalName = [text(user.first_name), text(user.last_name)].filter(Boolean).join(' ')
    return {
      id: taskId,
      name: row.name,
      dueDate: text(row.due_date),
      categoryId: optionalId(row.category_id),
      categoryName: text(relation(row.category).name),
      assignedToUserId: optionalId(row.assigned_to_user_id),
      assigneeName: text(user.display_name) ?? (personalName || text(user.username)),
    }
  })
}

export function categoryLabel(task: Task): string {
  return task.categoryName ?? (task.categoryId === null ? 'Uncategorized' : 'Category unavailable')
}

export function assigneeLabel(task: Task): string {
  return task.assigneeName ?? (task.assignedToUserId === null ? 'Unassigned' : 'User unavailable')
}

export function dueDateLabel(task: Task): string {
  // Keep the server's calendar date, without parsing it as UTC or shifting days.
  return task.dueDate?.match(/^\d{4}-\d{2}-\d{2}(?=$|[ T])/)?.[0] ?? task.dueDate ?? 'No due date'
}
