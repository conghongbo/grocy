import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type Battery,
    type BatteryInput,
    type BatteryUserfieldValues,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

export function useBatteries() {
    const [batteries, setBatteries] =
        useState<Battery[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [saving, setSaving] =
        useState(false);

    const [
        mutationError,
        setMutationError,
    ] = useState<string | null>(null);

    const loadBatteries =
        useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const result =
                    await batteriesApi.getAll();

                setBatteries(result);
            } catch (caughtError) {
                setError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load batteries",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialBatteries() {
            setLoading(true);
            setError(null);

            try {
                const result =
                    await batteriesApi.getAll();

                if (!cancelled) {
                    setBatteries(result);
                }
            } catch (caughtError) {
                if (!cancelled) {
                    setError(
                        getErrorMessage(
                            caughtError,
                            "Failed to load batteries",
                        ),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadInitialBatteries();

        return () => {
            cancelled = true;
        };
    }, []);

    const createBattery =
        useCallback(
            async (
                input: BatteryInput,
                userfields:
                    BatteryUserfieldValues,
            ): Promise<boolean> => {
                setSaving(true);
                setMutationError(null);

                try {
                    const result =
                        await batteriesApi.create(
                            input,
                        );

                    await batteriesApi.updateUserfields(
                        result.created_object_id,
                        userfields,
                    );

                    await loadBatteries();

                    return true;
                } catch (caughtError) {
                    setMutationError(
                        getErrorMessage(
                            caughtError,
                            "Failed to create battery",
                        ),
                    );

                    return false;
                } finally {
                    setSaving(false);
                }
            },
            [loadBatteries],
        );

    const updateBattery =
        useCallback(
            async (
                batteryId: number,
                input: BatteryInput,
                userfields:
                    BatteryUserfieldValues,
            ): Promise<boolean> => {
                setSaving(true);
                setMutationError(null);

                try {
                    await batteriesApi.update(
                        batteryId,
                        input,
                    );

                    await batteriesApi.updateUserfields(
                        batteryId,
                        userfields,
                    );

                    await loadBatteries();

                    return true;
                } catch (caughtError) {
                    setMutationError(
                        getErrorMessage(
                            caughtError,
                            "Failed to update battery",
                        ),
                    );

                    return false;
                } finally {
                    setSaving(false);
                }
            },
            [loadBatteries],
        );

    const deleteBattery =
        useCallback(
            async (
                batteryId: number,
            ): Promise<boolean> => {
                setSaving(true);
                setMutationError(null);

                try {
                    await batteriesApi.delete(
                        batteryId,
                    );

                    await loadBatteries();

                    return true;
                } catch (caughtError) {
                    setMutationError(
                        getErrorMessage(
                            caughtError,
                            "Failed to delete battery",
                        ),
                    );

                    return false;
                } finally {
                    setSaving(false);
                }
            },
            [loadBatteries],
        );

    return {
        batteries,
        loading,
        error,
        saving,
        mutationError,
        refresh: loadBatteries,
        createBattery,
        updateBattery,
        deleteBattery,
    };
}