import type {
    BatteryOverviewStateFilter,
} from "../../domain/batteries/batteriesOverviewFilters";

interface BatteriesOverviewFiltersProps {
    search: string;

    state:
    BatteryOverviewStateFilter;

    onSearchChange: (
        value: string,
    ) => void;

    onStateChange: (
        value: BatteryOverviewStateFilter,
    ) => void;

    onClear: () => void;

    hasActiveFilters: boolean;
}

export function BatteriesOverviewFilters({
    search,
    state,
    onSearchChange,
    onStateChange,
    onClear,
    hasActiveFilters,
}: BatteriesOverviewFiltersProps) {
    return (
        <div className="react-batteries-overview-filters">
            <label className="react-batteries-filter-field">
                <span>Search</span>

                <input
                    type="search"
                    className="form-control"
                    value={search}
                    placeholder="Search"
                    onChange={(event) =>
                        onSearchChange(
                            event.target
                                .value,
                        )
                    }
                />
            </label>

            <label className="react-batteries-filter-field">
                <span>Status</span>

                <select
                    className="form-control"
                    value={state}
                    onChange={(event) =>
                        onStateChange(
                            event.target
                                .value as BatteryOverviewStateFilter,
                        )
                    }
                >
                    <option value="all">
                        All
                    </option>

                    <option value="ready">
                        Ready
                    </option>

                    <option value="in_use">
                        In use
                    </option>

                    <option value="needs_charging">
                        Needs charging
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>
                </select>
            </label>

            <div className="react-batteries-filter-clear">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={
                        !hasActiveFilters
                    }
                    onClick={onClear}
                >
                    Clear filters
                </button>
            </div>
        </div>
    );
}