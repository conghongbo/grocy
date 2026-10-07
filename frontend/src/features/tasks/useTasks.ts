import { useEffect, useState } from 'react'
import { startTasksRead } from './tasksRequest.ts'
import type { TasksState } from './tasksRequest.ts'

export function useTasks() {
  const [state, setState] = useState<TasksState>({ status: 'loading' })
  const [revision, setRevision] = useState(0)
  useEffect(() => startTasksRead(setState), [revision])
  return { state, refresh: () => setRevision((value) => value + 1) }
}
