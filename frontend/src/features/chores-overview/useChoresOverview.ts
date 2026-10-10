import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    choresApi,
    type Chore,
    type CurrentChore,
} from "../../api/chores";

import type {
    ChoreOverviewItem,
} from "../../domain/chores/choreOverview";

import {
    getErrorMessage,
} from "../../utils/errors";

interface UseChoresOverviewResult {
    items: ChoreOverviewItem[];

    loading: boolean;

    error: string | null;
    refresh: () => Promise<void>;
}

export function useChoresOverview():
    UseChoresOverviewResult {
    const [
        chores,
        setChores,
    ] = useState<Chore[]>([]);

    const [
        currentChores,
        setCurrentChores,
    ] = useState<CurrentChore[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const loadOverview = useCallback(async () => {
        setLoading(true);

        try {
            const [choresResult, currentResult] = await Promise.all([
                choresApi.getAll(), choresApi.getCurrent(),
            ]);
            setChores(choresResult);
            setCurrentChores(currentResult);
            setError(null);
        } catch (caughtError) {
            setError(getErrorMessage(caughtError, "Failed to load chores overview"));
            throw caughtError;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadOverview().catch(() => undefined);
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [loadOverview]);

    const items = useMemo<
        ChoreOverviewItem[]
    >(() => {
        const choresById = new Map(
            chores.map((chore) => [
                chore.id,
                chore,
            ]),
        );

        return currentChores
            .map((current) => {
                const chore = choresById.get(
                    current.chore_id,
                );

                if (!chore) {
                    return null;
                }

                return {
                    chore,
                    current,
                };
            })
            .filter(
                (
                    item,
                ): item is ChoreOverviewItem =>
                    item !== null,
            );
    }, [chores, currentChores]);

    return {
        items,
        loading,
        error,
        refresh: loadOverview,
    };
}