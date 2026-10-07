import { getCurrentTasks } from '../../api/tasks.ts'
import type { Task } from '../../types/tasks.ts'

export type TasksState =
  | { status: 'loading' }
  | { status: 'success'; tasks: Task[] }
  | { status: 'error'; message: string }

// Each effect owns a request. Cleanup both aborts fetch and prevents a late
// response from publishing, even when a transport ignores AbortSignal.
export function startTasksRead(publish: (state: TasksState) => void): () => void {
  const controller = new AbortController()
  publish({ status: 'loading' })
  void getCurrentTasks(controller.signal).then(
    (tasks) => {
      if (!controller.signal.aborted) publish({ status: 'success', tasks })
    },
    (error: unknown) => {
      if (!controller.signal.aborted) {
        publish({ status: 'error', message: error instanceof Error ? error.message : 'Could not load tasks. Please retry.' })
      }
    },
  )
  return () => controller.abort()
}
