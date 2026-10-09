import type {
    BatteryFiltersState,
    BatteryTypeFilter,
} from "../../domain/batteries/batteryFilters";

interface BatteryFiltersProps {
    filters: BatteryFiltersState;

    visibleCount: number;

    totalCount: number;

    onChange: (
        filters: BatteryFiltersState,
    ) => void;

    onClear: () => void;
}

export function BatteryFilters({
    filters,
    visibleCount,
    totalCount,
    onChange,
    onClear,
}: BatteryFiltersProps) {
    const hasActiveFilters =
        filters.search.trim() !== "" ||
        filters.type !== "all" ||
        filters.showDisabled;

    function updateFilter<
        Key extends keyof BatteryFiltersState,
    >(
        key: Key,
        value: BatteryFiltersState[Key],
    ) {
        onChange({
            ...filters,
            [key]: value,
        });
    }

    return (
        <section className="react-battery-filters">
            <div className="react-battery-filters-header">
                <div>
                    <h3>
                        Filters
                    </h3>

                    <small>
                        Showing{" "}
                        {visibleCount} of{" "}
                        {totalCount} batteries
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={
                        !hasActiveFilters
                    }
                    onClick={onClear}
                >
                    Clear filters
                </button>
            </div>

            <div className="react-battery-filter-grid">
                <div className="react-battery-filter-field">
                    <label htmlFor="react-battery-search">
                        Search
                    </label>

                    <input
                        id="react-battery-search"
                        type="search"
                        className="form-control"
                        placeholder="Search name, description or used in"
                        value={
                            filters.search
                        }
                        onChange={(
                            event,
                        ) => {
                            updateFilter(
                                "search",
                                event
                                    .target
                                    .value,
                            );
                        }}
                    />
                </div>

                <div className="react-battery-filter-field">
                    <label htmlFor="react-battery-type-filter">
                        Type
                    </label>

                    <select
                        id="react-battery-type-filter"
                        className="form-control"
                        value={
                            filters.type
                        }
                        onChange={(
                            event,
                        ) => {
                            updateFilter(
                                "type",
                                event
                                    .target
                                    .value as BatteryTypeFilter,
                            );
                        }}
                    >
                        <option value="all">
                            All
                        </option>

                        <option value="rechargeable">
                            Rechargeable
                        </option>

                        <option value="non-rechargeable">
                            Non-rechargeable
                        </option>
                    </select>
                </div>

                <div className="react-battery-filter-field react-battery-filter-checkbox-field">
                    <label htmlFor="react-battery-show-disabled">
                        Visibility
                    </label>

                    <label className="react-battery-checkbox">
                        <input
                            id="react-battery-show-disabled"
                            type="checkbox"
                            checked={
                                filters.showDisabled
                            }
                            onChange={(
                                event,
                            ) => {
                                updateFilter(
                                    "showDisabled",
                                    event
                                        .target
                                        .checked,
                                );
                            }}
                        />

                        <span>
                            Show disabled
                        </span>
                    </label>
                </div>
            </div>
        </section>
    );
}