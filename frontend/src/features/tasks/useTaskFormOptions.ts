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

import {
    getErrorMessage,
} from "../../utils/errors";

interface UseTaskFormOptionsResult {
    categories: TaskCategory[];
    users: TaskAssignableUser[];
    loadingOptions: boolean;
    optionsError: string | null;
    refreshOptions: () => Promise<void>;
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
        let cancelled = false;

        async function initialiseOptions() {
            try {
                const [
                    categoryResult,
                    userResult,
                ] = await Promise.all([
                    tasksApi.getCategories(),
                    tasksApi.getAssignableUsers(),
                ]);

                if (cancelled) {
                    return;
                }

                setCategories(categoryResult);
                setUsers(userResult);
                setOptionsError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setOptionsError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load task form options",
                    ),
                );
            } finally {
                if (!cancelled) {
                    setLoadingOptions(false);
                }
            }
        }

        void initialiseOptions();

        return () => {
            cancelled = true;
        };
    }, []);

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