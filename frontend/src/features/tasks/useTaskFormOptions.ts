import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    tasksApi,
    type TaskAssignableUser,
    type TaskCategory,
} from "../../api/tasks";

interface UseTaskFormOptionsResult {
    categories: TaskCategory[];
    users: TaskAssignableUser[];
    loadingOptions: boolean;
    optionsError: string | null;
    refreshOptions: () => Promise<void>;
}

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
    return error instanceof Error
        ? error.message
        : fallback;
}

export function useTaskFormOptions():
    UseTaskFormOptionsResult {
    const [categories, setCategories] =
        useState<TaskCategory[]>([]);

    const [users, setUsers] =
        useState<TaskAssignableUser[]>([]);

    const [loadingOptions, setLoadingOptions] =
        useState(true);

    const [optionsError, setOptionsError] =
        useState<string | null>(null);

    const loadOptions = useCallback(async () => {
        try {
            const [
                categoryResult,
                userResult,
            ] = await Promise.all([
                tasksApi.getCategories(),
                tasksApi.getAssignableUsers(),
            ]);

            setCategories(categoryResult);
            setUsers(userResult);
            setOptionsError(null);
        } catch (caughtError) {
            setOptionsError(
                getErrorMessage(
                    caughtError,
                    "Failed to load task form options",
                ),
            );
        } finally {
            setLoadingOptions(false);
        }
    }, []);

    useEffect(() => {
        void loadOptions();
    }, [loadOptions]);

    const refreshOptions =
        useCallback(async () => {
            setLoadingOptions(true);
            await loadOptions();
        }, [loadOptions]);

    return {
        categories,
        users,
        loadingOptions,
        optionsError,
        refreshOptions,
    };
}