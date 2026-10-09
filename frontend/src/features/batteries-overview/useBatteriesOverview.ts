import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    batteriesApi,
    type Battery,
    type BatteryState,
    type CurrentBattery,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

import type {
    BatteryOverviewItem,
} from "../../domain/batteries/batteryOverview";

interface UseBatteriesOverviewResult {
    items: BatteryOverviewItem[];
    batteries: Battery[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

function getBatteryState(
    battery: Battery,
): BatteryState {
    if (Number(battery.active) === 0) {
        return "inactive";
    }

    if (
        battery.used_in !== null &&
        battery.used_in.trim() !== ""
    ) {
        return "in_use";
    }

    if (
        Number(battery.rechargeable) === 1 &&
        Number(battery.is_charged) === 0
    ) {
        return "needs_charging";
    }

    return "ready";
}

export function useBatteriesOverview():
    UseBatteriesOverviewResult {
    const [
        batteries,
        setBatteries,
    ] = useState<Battery[]>([]);

    const [
        current,
        setCurrent,
    ] = useState<CurrentBattery[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const loadOverview =
        useCallback(
            async () => {
                const [
                    batteriesResult,
                    currentResult,
                ] = await Promise.all([
                    batteriesApi.getAll(),
                    batteriesApi.getCurrent(),
                ]);

                setBatteries(
                    batteriesResult,
                );

                setCurrent(
                    currentResult,
                );
            },
            [],
        );

    useEffect(() => {
        let cancelled = false;

        async function loadInitialOverview() {
            try {
                const [
                    batteriesResult,
                    currentResult,
                ] = await Promise.all([
                    batteriesApi.getAll(),
                    batteriesApi.getCurrent(),
                ]);

                if (cancelled) {
                    return;
                }

                setBatteries(
                    batteriesResult,
                );

                setCurrent(
                    currentResult,
                );

                setError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load batteries overview",
                    ),
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadInitialOverview();

        return () => {
            cancelled = true;
        };
    }, []);

    const refresh =
        useCallback(
            async () => {
                setRefreshing(true);
                setError(null);

                try {
                    await loadOverview();
                } catch (caughtError) {
                    setError(
                        getErrorMessage(
                            caughtError,
                            "Failed to refresh batteries overview",
                        ),
                    );
                } finally {
                    setRefreshing(false);
                }
            },
            [loadOverview],
        );

    const items =
        useMemo<
            BatteryOverviewItem[]
        >(() => {
            const batteriesById =
                new Map(
                    batteries.map(
                        (battery) => [
                            battery.id,
                            battery,
                        ],
                    ),
                );

            return current
                .map(
                    (
                        currentBattery,
                    ) => {
                        const battery =
                            batteriesById.get(
                                currentBattery.battery_id,
                            );

                        if (!battery) {
                            return null;
                        }

                        return {
                            battery,
                            current:
                                currentBattery,
                            state:
                                getBatteryState(
                                    battery,
                                ),
                        };
                    },
                )
                .filter(
                    (
                        item,
                    ): item is BatteryOverviewItem =>
                        item !== null,
                );
        }, [
            batteries,
            current,
        ]);

    return {
        items,
        batteries,
        loading,
        refreshing,
        error,
        refresh,
    };
}