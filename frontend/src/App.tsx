import { context } from './app/context'
import { Overview } from './features/tasks/Overview'
import { TaskForm } from './features/tasks/TaskForm'
export default function App() {
  return context.page.endsWith('form') ? <TaskForm category={context.page === 'taskcategoryform'} /> : <Overview category={context.page === 'taskcategories'} />
}
