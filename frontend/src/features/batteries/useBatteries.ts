import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type Battery,
    type BatteryInput,
} from "../../api/batteries";

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
            } catch (loadError) {
                console.error(
                    "Failed to load batteries",
                    loadError,
                );

                setError(
                    "Failed to load batteries.",
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
            } catch (loadError) {
                console.error(
                    "Failed to load batteries",
                    loadError,
                );

                if (!cancelled) {
                    setError(
                        "Failed to load batteries.",
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
            ): Promise<boolean> => {
                setSaving(true);
                setMutationError(null);

                try {
                    await batteriesApi.create(
                        input,
                    );

                    await loadBatteries();

                    return true;
                } catch (createError) {
                    console.error(
                        "Failed to create battery",
                        createError,
                    );

                    setMutationError(
                        "Failed to create battery.",
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
            ): Promise<boolean> => {
                setSaving(true);
                setMutationError(null);

                try {
                    await batteriesApi.update(
                        batteryId,
                        input,
                    );

                    await loadBatteries();

                    return true;
                } catch (updateError) {
                    console.error(
                        "Failed to update battery",
                        updateError,
                    );

                    setMutationError(
                        "Failed to update battery.",
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
                } catch (deleteError) {
                    console.error(
                        "Failed to delete battery",
                        deleteError,
                    );

                    setMutationError(
                        "Failed to delete battery.",
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