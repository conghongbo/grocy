import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type BatteryChargeCycleEntry,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

interface UseBatteryChargeHistoryResult {
    history: BatteryChargeCycleEntry[];

    loading: boolean;

    mutatingId: number | null;

    error: string | null;

    refreshHistory: () => Promise<void>;

    undoChargeCycle: (
        chargeCycleId: number,
    ) => Promise<boolean>;
}

export function useBatteryChargeHistory(
    batteryId: number,
): UseBatteryChargeHistoryResult {
    const [
        history,
        setHistory,
    ] = useState<
        BatteryChargeCycleEntry[]
    >([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        mutatingId,
        setMutatingId,
    ] = useState<number | null>(
        null,
    );

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const refreshHistory =
        useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const result =
                    await batteriesApi
                        .getChargeHistory(
                            batteryId,
                        );

                setHistory(result);
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load charge history",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, [batteryId]);

    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            try {
                const result =
                    await batteriesApi
                        .getChargeHistory(
                            batteryId,
                        );

                if (cancelled) {
                    return;
                }

                setHistory(result);
                setError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load charge history",
                    ),
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadHistory();

        return () => {
            cancelled = true;
        };
    }, [batteryId]);

    async function undoChargeCycle(
        chargeCycleId: number,
    ): Promise<boolean> {
        setMutatingId(
            chargeCycleId,
        );
        setError(null);

        try {
            await batteriesApi
                .undoChargeCycle(
                    chargeCycleId,
                );

            await refreshHistory();

            return true;
        } catch (caughtError) {
            setError(
                getErrorMessage(
                    caughtError,
                    "Failed to undo charge cycle",
                ),
            );

            return false;
        } finally {
            setMutatingId(null);
        }
    }

    return {
        history,
        loading,
        mutatingId,
        error,
        refreshHistory,
        undoChargeCycle,
    };
}