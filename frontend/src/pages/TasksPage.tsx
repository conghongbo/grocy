import { TasksContent } from '../components/tasks/TasksContent.tsx'
import { useTasks } from '../features/tasks/useTasks.ts'

export default function TasksPage() {
  const { state, refresh } = useTasks()
  return (
    <main className="tasks-page">
      <header className="page-header">
        <div><p className="eyebrow">Grocy</p><h1>Tasks</h1></div>
        <span className="read-only-badge">Read only</span>
      </header>
      <section className="tasks-panel" aria-labelledby="list-heading" aria-busy={state.status === 'loading'}>
        <div className="panel-header">
          <div><h2 id="list-heading">Unfinished tasks</h2><p>All assignments. Manage tasks in the existing Grocy frontend.</p></div>
          <button type="button" className="secondary-button" onClick={refresh} disabled={state.status === 'loading'}>Refresh</button>
        </div>
        <TasksContent state={state} onRetry={refresh} />
      </section>
    </main>
  )
}
