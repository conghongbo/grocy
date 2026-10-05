import {
    useState,
    type FormEvent,
} from "react";

import type {
    Task,
    TaskInput,
} from "../../api/tasks";

interface TaskFormProps {
    task?: Task | null;
    saving: boolean;

    onSave: (input: TaskInput) => Promise<void>;
    onCancel: () => void;
}

export function TaskForm({
    task,
    saving,
    onSave,
    onCancel,
}: TaskFormProps) {
    const [name, setName] = useState(
        task?.name ?? "",
    );

    const [description, setDescription] =
        useState(
            task?.description ?? "",
        );

    const [dueDate, setDueDate] = useState(
        task?.due_date
            ? task.due_date.slice(0, 10)
            : "",
    );

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        void onSave({
            name: trimmedName,
            description: description.trim(),
            due_date: dueDate || null,

            // Category and user selection will be added
            // in the next parity stage.
            category_id:
                task?.category_id ?? null,

            assigned_to_user_id:
                task?.assigned_to_user_id ?? null,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>
                {task ? "Edit task" : "Create task"}
            </h2>

            <div>
                <label htmlFor="react-task-name">
                    Name
                </label>

                <input
                    id="react-task-name"
                    type="text"
                    required
                    disabled={saving}
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                    }}
                />
            </div>

            <div>
                <label htmlFor="react-task-description">
                    Description
                </label>

                <textarea
                    id="react-task-description"
                    rows={4}
                    disabled={saving}
                    value={description}
                    onChange={(event) => {
                        setDescription(
                            event.target.value,
                        );
                    }}
                />
            </div>

            <div>
                <label htmlFor="react-task-due-date">
                    Due
                </label>

                <input
                    id="react-task-due-date"
                    type="date"
                    disabled={saving}
                    value={dueDate}
                    onChange={(event) => {
                        setDueDate(event.target.value);
                    }}
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={
                        saving || name.trim() === ""
                    }
                >
                    {saving ? "Saving..." : "Save"}
                </button>

                {" "}

                <button
                    type="button"
                    disabled={saving}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}