import {
    useMemo,
    useState,
} from "react";

import type {
    Task,
    TaskInput,
} from "../../api/tasks";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { TaskForm } from "../../components/tasks/TaskForm";
import { TaskList } from "../../components/tasks/TaskList";
import { TaskFilters } from "../../components/tasks/TaskFilters";
import { TaskSummary } from "../../components/tasks/TaskSummary";

import { useTasks } from "./useTasks";
import { useTaskFormOptions } from "./useTaskFormOptions";
import {
    DEFAULT_TASK_FILTERS,
    filterTasks,
    getTaskSummary,
} from "../../domain/tasks/taskFilters";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useTaskPermissions } from "./useTaskPermissions";

export function TasksPage() {
    const {
        tasks,
        allTasks,
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

    const {
        user,
        loadingUser,
        userError,
    } = useCurrentUser();

    const {
        canManageTasks,
        loadingPermissions,
        permissionError,
    } = useTaskPermissions(
        user?.id ?? null,
    );

    const [showForm, setShowForm] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState<Task | null>(null);

    const [filters, setFilters] =
        useState(DEFAULT_TASK_FILTERS);

    const hydratedAllTasks =
        useMemo<Task[]>(() => {
            return allTasks.map((task) => {
                const category =
                    categories.find(
                        (item) =>
                            item.id ===
                            task.category_id,
                    ) ?? null;

                const assignedUser =
                    users.find(
                        (item) =>
                            item.id ===
                            task.assigned_to_user_id,
                    ) ?? null;

                return {
                    ...task,
                    category,
                    assigned_to_user:
                        assignedUser,
                };
            });
        }, [
            allTasks,
            categories,
            users,
        ]);

    const sourceTasks =
        filters.showDone
            ? hydratedAllTasks
            : tasks;

    const filteredTasks =
        useMemo(
            () =>
                filterTasks(
                    sourceTasks,
                    filters,
                ),
            [
                sourceTasks,
                filters,
            ],
        );

    const summary =
        useMemo(
            () => getTaskSummary(tasks),
            [tasks],
        );

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
        <section className="react-tasks-page">
            <div className="react-tasks-header">
                <div>
                    <h1 className="react-tasks-title">
                        Tasks
                    </h1>

                    <p className="react-tasks-subtitle">
                        Manage your tasks and keep track
                        of upcoming work
                    </p>

                    {!loadingUser && user && (
                        <small className="react-task-muted">
                            Signed in as{" "}
                            {user.display_name ??
                                user.username}
                        </small>
                    )}

                    {userError && (
                        <small className="react-task-muted">
                            User context unavailable
                        </small>
                    )}

                    {permissionError && (
                        <small className="react-task-muted">
                            Task permissions unavailable
                        </small>
                    )}
                </div>

                <div className="react-tasks-header-actions">
                    {!loadingPermissions &&
                        canManageTasks && (
                            <button
                                type="button"
                                className="
                react-task-btn
                react-task-btn-primary
            "
                                onClick={handleCreate}
                            >
                                ＋ Add
                            </button>
                        )}

                    <button
                        type="button"
                        className="react-task-btn"
                        onClick={() => {
                            void refresh();
                        }}
                    >
                        ↻ Refresh
                    </button>
                </div>
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

            <TaskSummary summary={summary} />

            <TaskFilters
                filters={filters}
                categories={categories}
                users={users}
                onChange={setFilters}
                onClear={() => {
                    setFilters(
                        DEFAULT_TASK_FILTERS,
                    );
                }}
            />

            {!showForm &&
                filteredTasks.length === 0 && (
                    <EmptyState message="No tasks found." />
                )}

            {filteredTasks.length > 0 && (
                <TaskList
                    tasks={filteredTasks}
                    canManageTasks={canManageTasks}
                    onComplete={completeTask}
                    onUndo={undoTask}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                />
            )}
        </section>
    );
}