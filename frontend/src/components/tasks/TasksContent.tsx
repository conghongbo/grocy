import type { TasksState } from '../../features/tasks/tasksRequest.ts'
import { TaskTable } from './TaskTable.tsx'

export function TasksContent({ state, onRetry }: { state: TasksState; onRetry: () => void }) {
  if (state.status === 'loading') return <p className="state-message" role="status">Loading tasks…</p>
  if (state.status === 'error') {
    return (
      <div className="state-message error-state" role="alert">
        <h2>Tasks could not be loaded</h2>
        <p>{state.message}</p>
        <button type="button" onClick={onRetry}>Retry</button>
      </div>
    )
  }
  if (state.tasks.length === 0) {
    return <div className="state-message" role="status"><h2>No unfinished tasks</h2><p>You’re all caught up.</p></div>
  }
  return <><p className="task-count" role="status">{state.tasks.length} unfinished {state.tasks.length === 1 ? 'task' : 'tasks'}</p><TaskTable tasks={state.tasks} /></>
}
