import {
    useMemo,
    useState,
} from "react";

import {
    BatteryOverviewDetailsModal,
} from "../../components/batteries/BatteryOverviewDetailsModal";

import {
    BatteriesOverviewDueSummary,
} from "../../components/batteries/BatteriesOverviewDueSummary";

import {
    BatteriesOverviewFilters,
} from "../../components/batteries/BatteriesOverviewFilters";

import {
    BatteriesOverviewList,
} from "../../components/batteries/BatteriesOverviewList";

import {
    BatteriesOverviewSummary,
} from "../../components/batteries/BatteriesOverviewSummary";

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
    filterBatteriesOverview,
    getBatteriesOverviewDueSummary,
    getBatteriesOverviewSummary,
    type BatteryOverviewDueFilter,
    type BatteryOverviewStateFilter,
} from "../../domain/batteries/batteriesOverviewFilters";

import {
    useBatteryOverviewDetails,
} from "../../domain/batteries/useBatteryOverviewDetails";

import {
    useOverviewChargeTracking,
} from "../../domain/batteries/useOverviewChargeTracking";

import {
    useCurrentUser,
} from "../../hooks/useCurrentUser";

import {
    useBatteryPermissions,
} from "../batteries/useBatteryPermissions";

import {
    useBatteriesOverview,
    type BatteryOverviewItem,
} from "./useBatteriesOverview";

const DEFAULT_DUE_SOON_DAYS = 5;

export function BatteriesOverviewPage() {
    const {
        items,
        loading,
        refreshing,
        error,
        refresh,
    } = useBatteriesOverview();

    const {
        user,
        loadingUser,
        userError,
    } = useCurrentUser();

    const {
        canTrackChargeCycle,
        loadingPermissions,
        permissionError,
    } = useBatteryPermissions(
        user?.id ?? null,
    );

    const {
        chargingBatteryId,
        chargeError,
        trackCharge,
    } = useOverviewChargeTracking(
        refresh,
    );

    const {
        details,
        loadingDetails,
        detailsError,
        openDetails,
        closeDetails,
    } = useBatteryOverviewDetails();

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        state,
        setState,
    ] =
        useState<BatteryOverviewStateFilter>(
            "all",
        );

    const [
        due,
        setDue,
    ] =
        useState<BatteryOverviewDueFilter>(
            "all",
        );

    const dueSoonDays =
        DEFAULT_DUE_SOON_DAYS;

    const summary =
        useMemo(
            () =>
                getBatteriesOverviewSummary(
                    items,
                ),
            [items],
        );

    const dueSummary =
        useMemo(
            () =>
                getBatteriesOverviewDueSummary(
                    items,
                    dueSoonDays,
                ),
            [
                items,
                dueSoonDays,
            ],
        );

    const filteredItems =
        useMemo(
            () =>
                filterBatteriesOverview(
                    items,
                    {
                        search,
                        state,
                        due,
                    },
                    dueSoonDays,
                ),
            [
                items,
                search,
                state,
                due,
                dueSoonDays,
            ],
        );

    const hasActiveFilters =
        search.trim() !== "" ||
        state !== "all" ||
        due !== "all";

    function clearFilters() {
        setSearch("");
        setState("all");
        setDue("all");
    }

    function handleOpenDetails(
        item: BatteryOverviewItem,
    ) {
        void openDetails(
            item.battery.id,
        );
    }

    async function handleTrackCharge(
        item: BatteryOverviewItem,
    ) {
        const confirmed =
            window.confirm(
                `Track a charge cycle for "${item.battery.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        await trackCharge(
            item.battery.id,
        );
    }

    if (
        loading ||
        loadingUser ||
        loadingPermissions
    ) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <ErrorState
                message={error}
            />
        );
    }

    if (userError) {
        return (
            <ErrorState
                message={userError}
            />
        );
    }

    if (permissionError) {
        return (
            <ErrorState
                message={permissionError}
            />
        );
    }

    return (
        <section className="react-batteries-overview">
            <div className="react-batteries-overview-header">
                <div>
                    <h3>
                        Batteries overview
                    </h3>

                    <p>
                        React overview
                    </p>
                </div>

                <div className="react-batteries-overview-header-status">
                    <span className="react-batteries-overview-count">
                        {filteredItems.length}
                        {" / "}
                        {items.length}
                        {" batteries"}
                    </span>

                    {refreshing && (
                        <span className="text-muted">
                            Refreshing...
                        </span>
                    )}
                </div>
            </div>

            <BatteriesOverviewDueSummary
                summary={dueSummary}
                dueSoonDays={
                    dueSoonDays
                }
                activeDue={due}
                onDueChange={
                    setDue
                }
            />

            <BatteriesOverviewSummary
                summary={summary}
                activeState={
                    state
                }
                onStateChange={
                    setState
                }
            />

            <BatteriesOverviewFilters
                search={search}
                state={state}
                onSearchChange={
                    setSearch
                }
                onStateChange={
                    setState
                }
                onClear={
                    clearFilters
                }
                hasActiveFilters={
                    hasActiveFilters
                }
            />

            {chargeError && (
                <ErrorState
                    message={
                        chargeError
                    }
                />
            )}

            {filteredItems.length ===
                0 ? (
                <EmptyState message="No batteries match the current filters." />
            ) : (
                <BatteriesOverviewList
                    items={
                        filteredItems
                    }
                    canTrackChargeCycle={
                        canTrackChargeCycle
                    }
                    chargingBatteryId={
                        chargingBatteryId
                    }
                    onOpenDetails={
                        handleOpenDetails
                    }
                    onTrackCharge={
                        handleTrackCharge
                    }
                />
            )}

            <BatteryOverviewDetailsModal
                details={
                    details
                }
                loading={
                    loadingDetails
                }
                error={
                    detailsError
                }
                onClose={
                    closeDetails
                }
            />
        </section>
    );
}