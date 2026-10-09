import {
    BatteriesOverviewList,
} from "../../components/batteries/BatteriesOverviewList";

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
    useBatteriesOverview,
} from "./useBatteriesOverview";

export function BatteriesOverviewPage() {
    const {
        items,
        loading,
        error,
    } = useBatteriesOverview();

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

    if (items.length === 0) {
        return (
            <EmptyState message="No batteries found." />
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
                        React read-only
                        overview baseline
                    </p>
                </div>

                <span className="react-batteries-overview-count">
                    {items.length} batteries
                </span>
            </div>

            <BatteriesOverviewList
                items={items}
            />
        </section>
    );
}