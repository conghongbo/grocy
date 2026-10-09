import {
    useMemo,
    useState,
} from "react";

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
    useBatteriesOverview,
} from "./useBatteriesOverview";

const DEFAULT_DUE_SOON_DAYS = 5;

export function BatteriesOverviewPage() {
    const {
        items,
        loading,
        error,
    } = useBatteriesOverview();

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

    /*
     * Phase 6B fallback.
     *
     * The Legacy page currently uses 5 days.
     * Once the Blade bootstrap context is wired
     * to the existing Grocy user setting, this
     * value should come from that context.
     */
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

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <ErrorState
                message={error}
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

                <span className="react-batteries-overview-count">
                    {filteredItems.length}
                    {" / "}
                    {items.length}
                    {" batteries"}
                </span>
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

            {filteredItems.length ===
                0 ? (
                <EmptyState message="No batteries match the current filters." />
            ) : (
                <BatteriesOverviewList
                    items={
                        filteredItems
                    }
                />
            )}
        </section>
    );
}