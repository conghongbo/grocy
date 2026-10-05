import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    tasksApi,
    type Task,
    type TaskInput,
} from "../../api/tasks";

interface UseTasksResult {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    saving: boolean;

    refresh: () => Promise<void>;
    completeTask: (taskId: number) => Promise<void>;
    undoTask: (taskId: number) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
    createTask: (
        input: TaskInput,
    ) => Promise<boolean>;
    updateTask: (
        taskId: number,
        input: TaskInput,
    ) => Promise<boolean>;
}

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
    return error instanceof Error
        ? error.message
        : fallback;
}

export function useTasks(): UseTasksResult {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(
        null,
    );

    const loadTasks = useCallback(async () => {
        try {
            const result = await tasksApi.getCurrent();

            setTasks(result);
            setError(null);
        } catch (caughtError) {
            setError(
                getErrorMessage(
                    caughtError,
                    "Failed to load tasks",
                ),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    const refresh = useCallback(async () => {
        setLoading(true);

        await loadTasks();
    }, [loadTasks]);

    const completeTask = useCallback(
        async (taskId: number) => {
            setError(null);

            try {
                await tasksApi.complete(taskId);
                await loadTasks();
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to complete task",
                    ),
                );
            }
        },
        [loadTasks],
    );

    const undoTask = useCallback(
        async (taskId: number) => {
            setError(null);

            try {
                await tasksApi.undo(taskId);
                await loadTasks();
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to undo task",
                    ),
                );
            }
        },
        [loadTasks],
    );

    const deleteTask = useCallback(
        async (taskId: number) => {
            setError(null);

            try {
                await tasksApi.remove(taskId);
                await loadTasks();
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to delete task",
                    ),
                );
            }
        },
        [loadTasks],
    );

    const createTask = useCallback(
        async (
            input: TaskInput,
        ): Promise<boolean> => {
            setSaving(true);
            setError(null);

            try {
                await tasksApi.create(input);
                await loadTasks();

                return true;
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to create task",
                    ),
                );

                return false;
            } finally {
                setSaving(false);
            }
        },
        [loadTasks],
    );

    const updateTask = useCallback(
        async (
            taskId: number,
            input: TaskInput,
        ): Promise<boolean> => {
            setSaving(true);
            setError(null);

            try {
                await tasksApi.update(
                    taskId,
                    input,
                );

                await loadTasks();

                return true;
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to update task",
                    ),
                );

                return false;
            } finally {
                setSaving(false);
            }
        },
        [loadTasks],
    );

    return {
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
    };
}