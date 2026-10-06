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
        <form
            className="
        react-task-card
        react-task-form
    "
            onSubmit={handleSubmit}
        >
            <div className="react-task-card-header">
                {task ? "Edit task" : "Create task"}
            </div>

            <div className="react-task-card-body">
                <div className="react-task-form-grid">
                    <div className="react-task-field">
                        <label htmlFor="react-task-name">
                            Name
                        </label>

                        <input
                            className="react-task-control"
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

                    <div
                        className="
        react-task-field
        react-task-form-full
    "
                    >
                        <label htmlFor="react-task-description">
                            Description
                        </label>

                        <textarea
                            className="react-task-control"
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

                    <div className="react-task-field">
                        <label htmlFor="react-task-due-date">
                            Due
                        </label>

                        <input
                            className="react-task-control"
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

                    <div className="react-task-field">
                        <label htmlFor="react-task-category">
                            Category
                        </label>

                        <select
                            className="react-task-control"
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

                    <div className="react-task-field">
                        <label htmlFor="react-task-assigned-user">
                            Assigned to
                        </label>

                        <select
                            className="react-task-control"
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

                    <div className="react-task-form-actions">
                        <button
                            type="submit"
                            className="
        react-task-btn
        react-task-btn-primary
    "
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
                            className="react-task-btn"
                            disabled={saving}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}