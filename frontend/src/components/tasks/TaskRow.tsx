import type { Task } from "../../api/tasks";

import {
    isTaskDueSoon,
    isTaskDueToday,
    isTaskOverdue,
} from "../../features/tasks/taskFilters";

interface TaskRowProps {
    task: Task;

    canManageTasks: boolean;

    onComplete:
    (taskId: number) => Promise<void>;

    onUndo:
    (taskId: number) => Promise<void>;

    onEdit:
    (task: Task) => void;

    onDelete:
    (taskId: number) => Promise<void>;
}

export function TaskRow({
    task,
    canManageTasks,
    onComplete,
    onUndo,
    onEdit,
    onDelete,
}: TaskRowProps) {
    const isDone = task.done === 1;
    const overdue = isTaskOverdue(task);
    const dueToday = isTaskDueToday(task);
    const dueSoon = isTaskDueSoon(task);

    let rowClassName = "";

    if (overdue) {
        rowClassName =
            "react-task-row-overdue";
    }

    if (isDone) {
        rowClassName =
            "react-task-row-completed";
    }

    const handleDelete = () => {
        void onDelete(task.id);
    };

    return (
        <tr className={rowClassName}>
            <td>
                <div className="react-task-name">
                    {task.name}
                </div>

                {task.description && (
                    <div className="react-task-description">
                        {task.description}
                    </div>
                )}
            </td>

            <td>
                <div>
                    {task.due_date
                        ? task.due_date.slice(
                            0,
                            10,
                        )
                        : "—"}
                </div>

                {overdue && (
                    <span
                        className="
                            react-task-badge
                            react-task-badge-danger
                        "
                    >
                        Overdue
                    </span>
                )}

                {dueToday && (
                    <span
                        className="
                            react-task-badge
                            react-task-badge-info
                        "
                    >
                        Due today
                    </span>
                )}

                {dueSoon && (
                    <span
                        className="
                            react-task-badge
                            react-task-badge-warning
                        "
                    >
                        Due soon
                    </span>
                )}
            </td>

            <td>
                {task.category?.name ?? (
                    <span className="react-task-muted">
                        Uncategorized
                    </span>
                )}
            </td>

            <td>
                {task.assigned_to_user
                    ?.display_name ??
                    task.assigned_to_user
                        ?.username ?? (
                        <span className="react-task-muted">
                            Unassigned
                        </span>
                    )}
            </td>

            <td>
                {isDone ? (
                    <span
                        className="
                            react-task-badge
                            react-task-badge-success
                        "
                    >
                        Completed
                    </span>
                ) : (
                    <span
                        className="
                            react-task-badge
                            react-task-badge-secondary
                        "
                    >
                        Open
                    </span>
                )}
            </td>

            <td>
                {canManageTasks ? (
                    <div className="react-task-actions">
                        {isDone ? (
                            <button
                                type="button"
                                className="
                        react-task-btn
                        react-task-btn-success
                        react-task-btn-sm
                    "
                                onClick={() => {
                                    void onUndo(
                                        task.id,
                                    );
                                }}
                            >
                                Undo
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="
                        react-task-btn
                        react-task-btn-success
                        react-task-btn-sm
                    "
                                onClick={() => {
                                    void onComplete(
                                        task.id,
                                    );
                                }}
                            >
                                ✓
                            </button>
                        )}

                        <button
                            type="button"
                            className="
                    react-task-btn
                    react-task-btn-info
                    react-task-btn-sm
                "
                            onClick={() => {
                                onEdit(task);
                            }}
                        >
                            ✎
                        </button>

                        <button
                            type="button"
                            className="
                    react-task-btn
                    react-task-btn-danger
                    react-task-btn-sm
                "
                            onClick={handleDelete}
                        >
                            🗑
                        </button>
                    </div>
                ) : (
                    <span className="react-task-muted">
                        Read only
                    </span>
                )}
            </td>
        </tr>
    );
}