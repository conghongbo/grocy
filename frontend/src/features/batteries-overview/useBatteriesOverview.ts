import {
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

export interface BatteryOverviewItem {
    battery: Battery;
    current: CurrentBattery;
    state: BatteryState;
}

interface UseBatteriesOverviewResult {
    items: BatteryOverviewItem[];
    loading: boolean;
    error: string | null;
}

function getBatteryState(
    battery: Battery,
): BatteryState {
    if (battery.active === 0) {
        return "inactive";
    }

    if (
        battery.used_in !== null &&
        battery.used_in.trim() !== ""
    ) {
        return "in_use";
    }

    if (
        battery.rechargeable === 1 &&
        battery.is_charged === 0
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
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    useEffect(() => {
        let cancelled = false;

        async function loadOverview() {
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

        void loadOverview();

        return () => {
            cancelled = true;
        };
    }, []);

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
                .map((currentBattery) => {
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
                })
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
        loading,
        error,
    };
}