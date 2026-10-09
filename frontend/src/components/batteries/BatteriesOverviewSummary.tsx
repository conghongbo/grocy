import type {
    BatteriesOverviewSummary,
    BatteryOverviewStateFilter,
} from "../../domain/batteries/batteriesOverviewFilters";

interface BatteriesOverviewSummaryProps {
    summary: BatteriesOverviewSummary;
    activeState:
    BatteryOverviewStateFilter;
    onStateChange: (
        state: BatteryOverviewStateFilter,
    ) => void;
}

export function BatteriesOverviewSummary({
    summary,
    activeState,
    onStateChange,
}: BatteriesOverviewSummaryProps) {
    return (
        <div className="react-batteries-overview-summary">
            <button
                type="button"
                className={
                    activeState === "all"
                        ? "react-batteries-summary-card active"
                        : "react-batteries-summary-card"
                }
                onClick={() =>
                    onStateChange("all")
                }
            >
                <span>Total batteries</span>
                <strong>
                    {summary.total}
                </strong>
            </button>

            <button
                type="button"
                className={
                    activeState === "ready"
                        ? "react-batteries-summary-card active"
                        : "react-batteries-summary-card"
                }
                onClick={() =>
                    onStateChange(
                        "ready",
                    )
                }
            >
                <span>Ready</span>
                <strong>
                    {summary.ready}
                </strong>
            </button>

            <button
                type="button"
                className={
                    activeState === "in_use"
                        ? "react-batteries-summary-card active"
                        : "react-batteries-summary-card"
                }
                onClick={() =>
                    onStateChange(
                        "in_use",
                    )
                }
            >
                <span>In use</span>
                <strong>
                    {summary.inUse}
                </strong>
            </button>

            <button
                type="button"
                className={
                    activeState ===
                        "needs_charging"
                        ? "react-batteries-summary-card active"
                        : "react-batteries-summary-card"
                }
                onClick={() =>
                    onStateChange(
                        "needs_charging",
                    )
                }
            >
                <span>
                    Needs charging
                </span>

                <strong>
                    {
                        summary.needsCharging
                    }
                </strong>
            </button>
        </div>
    );
}