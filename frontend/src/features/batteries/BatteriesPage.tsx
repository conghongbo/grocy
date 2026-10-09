import {
    useMemo,
    useState,
} from "react";

import type {
    Battery,
    BatteryInput,
} from "../../api/batteries";

import {
    BatteryFilters,
} from "../../components/batteries/BatteryFilters";

import {
    BatteryForm,
} from "../../components/batteries/BatteryForm";

import {
    BatteryList,
} from "../../components/batteries/BatteryList";

import {
    BatterySummary,
} from "../../components/batteries/BatterySummary";

import {
    BatteryTrackingPanel,
} from "../../components/batteries/BatteryTrackingPanel";

import {
    EmptyState,
} from "../../components/common/EmptyState";

import {
    ErrorState,
} from "../../components/common/ErrorState";

import {
    LoadingState,
} from "../../components/common/LoadingState";

import {
    useCurrentUser,
} from "../../hooks/useCurrentUser";

import {
    DEFAULT_BATTERY_FILTERS,
    filterBatteries,
    getBatterySummary,
    type BatteryFiltersState,
} from "./batteryFilters";

import {
    useBatteries,
} from "./useBatteries";

import {
    useBatteryPermissions,
} from "./useBatteryPermissions";

export function BatteriesPage() {
    const [
        editingBattery,
        setEditingBattery,
    ] = useState<Battery | null>(
        null,
    );

    const [
        trackingBattery,
        setTrackingBattery,
    ] = useState<Battery | null>(
        null,
    );

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        filters,
        setFilters,
    ] = useState<BatteryFiltersState>(
        DEFAULT_BATTERY_FILTERS,
    );

    const {
        batteries,
        loading,
        error,
        saving,
        mutationError,
        refresh,
        createBattery,
        updateBattery,
        deleteBattery,
    } = useBatteries();

    const {
        user,
        loadingUser,
        userError,
    } = useCurrentUser();

    const {
        canManageBatteries,
        canTrackChargeCycle,
        canUndoChargeCycle,
        loadingPermissions,
        permissionError,
    } = useBatteryPermissions(
        user?.id ?? null,
    );

    const permissionsReady =
        !loadingUser &&
        !loadingPermissions;

    const summary = useMemo(
        () =>
            getBatterySummary(
                batteries,
            ),
        [batteries],
    );

    const filteredBatteries =
        useMemo(
            () =>
                filterBatteries(
                    batteries,
                    filters,
                ),
            [
                batteries,
                filters,
            ],
        );

    const canOpenTracking =
        permissionsReady &&
        (
            canTrackChargeCycle ||
            canUndoChargeCycle
        );

    async function handleSave(
        input: BatteryInput,
    ): Promise<boolean> {
        if (!canManageBatteries) {
            return false;
        }

        if (editingBattery) {
            return updateBattery(
                editingBattery.id,
                input,
            );
        }

        return createBattery(
            input,
        );
    }

    function handleAdd() {
        setTrackingBattery(null);
        setEditingBattery(null);
        setShowForm(true);
    }

    function handleEdit(
        battery: Battery,
    ) {
        if (!canManageBatteries) {
            return;
        }

        setTrackingBattery(null);
        setEditingBattery(battery);
        setShowForm(true);
    }

    function handleTrack(
        battery: Battery,
    ) {
        if (!canOpenTracking) {
            return;
        }

        setEditingBattery(null);
        setShowForm(false);
        setTrackingBattery(
            battery,
        );
    }

    async function handleDelete(
        battery: Battery,
    ) {
        if (!canManageBatteries) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete battery "${battery.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        const success =
            await deleteBattery(
                battery.id,
            );

        if (
            success &&
            editingBattery?.id ===
            battery.id
        ) {
            setEditingBattery(null);
            setShowForm(false);
        }

        if (
            success &&
            trackingBattery?.id ===
            battery.id
        ) {
            setTrackingBattery(
                null,
            );
        }
    }

    function handleCancelForm() {
        setEditingBattery(null);
        setShowForm(false);
    }

    function handleClearFilters() {
        setFilters(
            DEFAULT_BATTERY_FILTERS,
        );
    }

    return (
        <section className="react-batteries-page">
            <header className="react-batteries-header">
                <div>
                    <h2>
                        Batteries
                    </h2>

                    <p>
                        Manage batteries,
                        availability and
                        charging information
                    </p>

                    {user && (
                        <small className="text-muted">
                            Signed in as{" "}
                            {user.username}
                        </small>
                    )}
                </div>

                <div className="react-batteries-header-actions">
                    {permissionsReady &&
                        canManageBatteries && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={
                                    saving
                                }
                                onClick={
                                    handleAdd
                                }
                            >
                                + Add
                            </button>
                        )}

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={
                            loading ||
                            saving
                        }
                        onClick={() => {
                            void refresh();
                        }}
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>
                </div>
            </header>

            {userError && (
                <p className="text-warning">
                    Failed to load
                    current user.
                </p>
            )}

            {permissionError && (
                <p className="text-warning">
                    Battery permissions
                    unavailable.
                </p>
            )}

            {mutationError && (
                <p className="text-danger">
                    {mutationError}
                </p>
            )}

            {showForm &&
                permissionsReady &&
                canManageBatteries && (
                    <BatteryForm
                        key={
                            editingBattery
                                ? `edit-${editingBattery.id}`
                                : "add"
                        }
                        battery={
                            editingBattery
                        }
                        saving={saving}
                        onSave={
                            handleSave
                        }
                        onCancel={
                            handleCancelForm
                        }
                    />
                )}

            {trackingBattery &&
                canOpenTracking && (
                    <BatteryTrackingPanel
                        key={
                            trackingBattery.id
                        }
                        battery={
                            trackingBattery
                        }
                        batteries={
                            batteries
                        }
                        canTrackChargeCycle={
                            canTrackChargeCycle
                        }
                        canUndoChargeCycle={
                            canUndoChargeCycle
                        }
                        refreshBatteries={
                            refresh
                        }
                        onClose={() => {
                            setTrackingBattery(
                                null,
                            );
                        }}
                    />
                )}

            {loading &&
                batteries.length ===
                0 && (
                    <LoadingState />
                )}

            {error && (
                <ErrorState
                    message={error}
                />
            )}

            {!error &&
                batteries.length >
                0 && (
                    <>
                        <BatterySummary
                            summary={
                                summary
                            }
                        />

                        <BatteryFilters
                            filters={
                                filters
                            }
                            visibleCount={
                                filteredBatteries.length
                            }
                            totalCount={
                                batteries.length
                            }
                            onChange={
                                setFilters
                            }
                            onClear={
                                handleClearFilters
                            }
                        />

                        {filteredBatteries.length >
                            0 ? (
                            <BatteryList
                                batteries={
                                    filteredBatteries
                                }
                                canManage={
                                    permissionsReady &&
                                    canManageBatteries
                                }
                                canOpenTracking={
                                    canOpenTracking
                                }
                                saving={
                                    saving
                                }
                                onTrack={
                                    handleTrack
                                }
                                onEdit={
                                    handleEdit
                                }
                                onDelete={(
                                    battery,
                                ) => {
                                    void handleDelete(
                                        battery,
                                    );
                                }}
                            />
                        ) : (
                            <EmptyState
                                message="No batteries match the current filters."
                            />
                        )}
                    </>
                )}

            {!loading &&
                !error &&
                batteries.length ===
                0 && (
                    <EmptyState
                        message="No batteries found."
                    />
                )}
        </section>
    );
}