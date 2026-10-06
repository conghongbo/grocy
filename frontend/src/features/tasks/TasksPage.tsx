import { useState } from "react";

import type {
    Task,
    TaskInput,
} from "../../api/tasks";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { TaskForm } from "../../components/tasks/TaskForm";
import { TaskList } from "../../components/tasks/TaskList";

import { useTasks } from "./useTasks";
import { useTaskFormOptions } from "./useTaskFormOptions";

export function TasksPage() {
    const {
        tasks,
        loading,
        saving,
        error,
        refresh,
        completeTask,
        undoTask,
        deleteTask,
        createTask,
        updateTask,
    } = useTasks();

    const {
        categories,
        users,
        loadingOptions,
        optionsError,
        refreshOptions,
    } = useTaskFormOptions();

    const [showForm, setShowForm] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState<Task | null>(null);

    const handleCreate = () => {
        setEditingTask(null);
        setShowForm(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingTask(null);
        setShowForm(false);
    };

    const handleSave = async (
        input: TaskInput,
    ) => {
        const success = editingTask
            ? await updateTask(
                editingTask.id,
                input,
            )
            : await createTask(input);

        if (success) {
            setEditingTask(null);
            setShowForm(false);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <section>
            <div>
                <h1>Tasks</h1>

                <button
                    type="button"
                    onClick={handleCreate}
                >
                    Add task
                </button>

                {" "}

                <button
                    type="button"
                    onClick={() => {
                        void refresh();
                    }}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <ErrorState message={error} />
            )}

            {optionsError && (
                <div>
                    <ErrorState message={optionsError} />

                    <button
                        type="button"
                        onClick={() => {
                            void refreshOptions();
                        }}
                    >
                        Retry loading form options
                    </button>
                </div>
            )}

            {showForm && (
                <TaskForm
                    task={editingTask}
                    categories={categories}
                    users={users}
                    saving={saving}
                    loadingOptions={loadingOptions}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}

            {!showForm &&
                tasks.length === 0 && (
                    <EmptyState message="No tasks found." />
                )}

            {tasks.length > 0 && (
                <TaskList
                    tasks={tasks}
                    onComplete={completeTask}
                    onUndo={undoTask}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                />
            )}
        </section>
    );
}