import {
    LoadingState,
} from "../../components/common/LoadingState";

import {
    ErrorState,
} from "../../components/common/ErrorState";

import {
    ChoresOverviewList,
} from "../../components/chores/ChoresOverviewList";

import {
    useChoresOverview,
} from "./useChoresOverview";

export function ChoresOverviewPage() {
    const {
        items,
        loading,
        error,
    } = useChoresOverview();

    return (
        <section className="react-chores-overview">
            <header className="react-chores-overview-header">
                <div>
                    <h3>
                        Chores Overview
                    </h3>

                    <p>
                        React implementation
                        — Phase 7B
                    </p>
                </div>

                {!loading && !error && (
                    <span className="react-chores-overview-count">
                        {items.length} chores
                    </span>
                )}
            </header>

            {loading && (
                <LoadingState />
            )}

            {!loading && error && (
                <ErrorState
                    message={error}
                />
            )}

            {!loading && !error && (
                <ChoresOverviewList
                    items={items}
                />
            )}
        </section>
    );
}