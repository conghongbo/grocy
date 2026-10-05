import type { Task } from "../../api/tasks";

interface TaskRowProps {
    task: Task;
    onComplete: (taskId: number) => Promise<void>;
    onUndo: (taskId: number) => Promise<void>;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => Promise<void>;
}

export function TaskRow({
    task,
    onComplete,
    onUndo,
    onEdit,
    onDelete,
}: TaskRowProps) {
    const isDone = task.done === 1;

    const handleComplete = () => {
        void onComplete(task.id);
    };

    const handleUndo = () => {
        void onUndo(task.id);
    };

    const handleDelete = () => {
        void onDelete(task.id);
    };

    return (
        <tr>
            <td>
                <strong>{task.name}</strong>

                {task.description && (
                    <div>
                        <small>{task.description}</small>
                    </div>
                )}
            </td>

            <td>
                {task.category?.name ?? "—"}
            </td>

            <td>
                {task.assigned_to_user?.display_name ??
                    task.assigned_to_user?.username ??
                    "—"}
            </td>

            <td>
                {task.due_date ?? "—"}
            </td>

            <td>
                {isDone ? "Completed" : "Open"}
            </td>

            <td>
                {isDone ? (
                    <button
                        type="button"
                        onClick={handleUndo}
                    >
                        Undo
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleComplete}
                    >
                        Complete
                    </button>
                )}

                {" "}

                <button
                    type="button"
                    onClick={() => {
                        onEdit(task);
                    }}
                >
                    Edit
                </button>

                {" "}

                <button
                    type="button"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}