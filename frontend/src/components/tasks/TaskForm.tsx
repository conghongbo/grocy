import {
    useState,
    type FormEvent,
} from "react";

import type {
    Task,
    TaskAssignableUser,
    TaskCategory,
    TaskInput,
} from "../../api/tasks";

interface TaskFormProps {
    task?: Task | null;

    categories: TaskCategory[];
    users: TaskAssignableUser[];

    saving: boolean;
    loadingOptions: boolean;

    onSave: (input: TaskInput) => Promise<void>;
    onCancel: () => void;
}

export function TaskForm({
    task,
    categories,
    users,
    saving,
    loadingOptions,
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

    const [
        categoryId,
        setCategoryId,
    ] = useState(
        task?.category_id?.toString() ?? "",
    );

    const [
        assignedToUserId,
        setAssignedToUserId,
    ] = useState(
        task?.assigned_to_user_id?.toString() ?? "",
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

            description:
                description.trim(),

            due_date:
                dueDate || null,

            category_id:
                categoryId === ""
                    ? null
                    : Number(categoryId),

            assigned_to_user_id:
                assignedToUserId === ""
                    ? null
                    : Number(
                        assignedToUserId,
                    ),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>
                {task
                    ? "Edit task"
                    : "Create task"}
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
                        setName(
                            event.target.value,
                        );
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
                        setDueDate(
                            event.target.value,
                        );
                    }}
                />
            </div>

            <div>
                <label htmlFor="react-task-category">
                    Category
                </label>

                <select
                    id="react-task-category"
                    disabled={
                        saving ||
                        loadingOptions
                    }
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(
                            event.target.value,
                        );
                    }}
                >
                    <option value="">
                        Uncategorized
                    </option>

                    {categories.map(
                        (category) => (
                            <option
                                key={category.id}
                                value={
                                    category.id
                                }
                            >
                                {category.name}
                            </option>
                        ),
                    )}
                </select>
            </div>

            <div>
                <label htmlFor="react-task-assigned-user">
                    Assigned to
                </label>

                <select
                    id="react-task-assigned-user"
                    disabled={
                        saving ||
                        loadingOptions
                    }
                    value={
                        assignedToUserId
                    }
                    onChange={(event) => {
                        setAssignedToUserId(
                            event.target.value,
                        );
                    }}
                >
                    <option value="">
                        Unassigned
                    </option>

                    {users.map((user) => (
                        <option
                            key={user.id}
                            value={user.id}
                        >
                            {user.display_name ??
                                user.username}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={
                        saving ||
                        loadingOptions ||
                        name.trim() === ""
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save"}
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