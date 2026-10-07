import { assigneeLabel, categoryLabel, dueDateLabel } from '../../features/tasks/taskModel.ts'
import type { Task } from '../../types/tasks.ts'

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="table-scroll" role="region" aria-label="Task list" tabIndex={0}>
      <table>
        <caption className="sr-only">All unfinished tasks</caption>
        <thead>
          <tr><th scope="col">Name</th><th scope="col">Due date</th><th scope="col">Category</th><th scope="col">Assigned to</th></tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} data-task-id={task.id}>
              <th scope="row">{task.name || 'Unnamed task'}</th>
              <td>{dueDateLabel(task)}</td>
              <td>{categoryLabel(task)}</td>
              <td>{assigneeLabel(task)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
