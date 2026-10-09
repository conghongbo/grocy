import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type Battery,
    type BatteryDetails,
} from "../../api/batteries";

interface UseBatteryTrackingResult {
    details: BatteryDetails | null;
    loading: boolean;
    mutating: boolean;
    error: string | null;

    refreshDetails: () => Promise<void>;

    trackCharge: (
        trackedTime?: string,
    ) => Promise<boolean>;

    replaceBattery: (
        replacementBatteryId: number,
    ) => Promise<boolean>;
}

export function useBatteryTracking(
    battery: Battery | null,
    refreshBatteries: () => Promise<void>,
): UseBatteryTrackingResult {
    const batteryId =
        battery?.id ?? null;

    const [details, setDetails] =
        useState<BatteryDetails | null>(
            null,
        );

    const [loading, setLoading] =
        useState(
            batteryId !== null,
        );

    const [mutating, setMutating] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const refreshDetails =
        useCallback(async () => {
            if (batteryId === null) {
                setDetails(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result =
                    await batteriesApi.getDetails(
                        batteryId,
                    );

                setDetails(result);
            } catch (caughtError) {
                setDetails(null);

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Failed to load battery details",
                );
            } finally {
                setLoading(false);
            }
        }, [batteryId]);

    useEffect(() => {
        if (batteryId === null) {
            return;
        }

        let cancelled = false;

        async function loadInitialDetails() {
            try {
                const result =
                    await batteriesApi.getDetails(
                        batteryId as number,
                    );

                if (!cancelled) {
                    setDetails(result);
                }
            } catch (caughtError) {
                if (!cancelled) {
                    setDetails(null);

                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Failed to load battery details",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadInitialDetails();

        return () => {
            cancelled = true;
        };
    }, [batteryId]);

    const trackCharge =
        useCallback(
            async (
                trackedTime?: string,
            ): Promise<boolean> => {
                if (
                    batteryId === null
                ) {
                    return false;
                }

                setMutating(true);
                setError(null);

                try {
                    await batteriesApi
                        .trackChargeCycle(
                            batteryId,
                            trackedTime
                                ? {
                                    tracked_time:
                                        trackedTime,
                                }
                                : {},
                        );

                    await Promise.all([
                        refreshDetails(),
                        refreshBatteries(),
                    ]);

                    return true;
                } catch (caughtError) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Failed to track charge cycle",
                    );

                    return false;
                } finally {
                    setMutating(false);
                }
            },
            [
                batteryId,
                refreshBatteries,
                refreshDetails,
            ],
        );

    const replaceBattery =
        useCallback(
            async (
                replacementBatteryId: number,
            ): Promise<boolean> => {
                if (
                    batteryId === null
                ) {
                    return false;
                }

                setMutating(true);
                setError(null);

                try {
                    await batteriesApi
                        .replaceBattery(
                            batteryId,
                            replacementBatteryId,
                        );

                    await Promise.all([
                        refreshDetails(),
                        refreshBatteries(),
                    ]);

                    return true;
                } catch (caughtError) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Failed to replace battery",
                    );

                    return false;
                } finally {
                    setMutating(false);
                }
            },
            [
                batteryId,
                refreshBatteries,
                refreshDetails,
            ],
        );

    return {
        details,
        loading,
        mutating,
        error,
        refreshDetails,
        trackCharge,
        replaceBattery,
    };
}