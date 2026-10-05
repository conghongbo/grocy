import type { Task } from "../../api/tasks";

import { TaskRow } from "./TaskRow";

interface TaskListProps {
    tasks: Task[];
    onComplete: (taskId: number) => Promise<void>;
    onUndo: (taskId: number) => Promise<void>;
    onDelete: (taskId: number) => Promise<void>;
}

export function TaskList({
    tasks,
    onComplete,
    onUndo,
    onDelete,
}: TaskListProps) {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Category</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onComplete={onComplete}
                            onUndo={onUndo}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}