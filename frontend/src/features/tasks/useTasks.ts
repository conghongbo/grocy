import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    tasksApi,
    type Task,
} from "../../api/tasks";

interface UseTasksResult {
    tasks: Task[];
    loading: boolean;
    error: string | null;

    refresh: () => Promise<void>;
    completeTask: (taskId: number) => Promise<void>;
    undoTask: (taskId: number) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
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

    return {
        tasks,
        loading,
        error,

        refresh,
        completeTask,
        undoTask,
        deleteTask,
    };
}