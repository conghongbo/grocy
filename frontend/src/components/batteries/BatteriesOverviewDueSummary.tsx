import type {
    BatteriesOverviewDueSummary,
    BatteryOverviewDueFilter,
} from "../../domain/batteries/batteriesOverviewFilters";

interface BatteriesOverviewDueSummaryProps {
    summary:
    BatteriesOverviewDueSummary;

    dueSoonDays: number;

    activeDue:
    BatteryOverviewDueFilter;

    onDueChange: (
        due: BatteryOverviewDueFilter,
    ) => void;
}

export function BatteriesOverviewDueSummary({
    summary,
    dueSoonDays,
    activeDue,
    onDueChange,
}: BatteriesOverviewDueSummaryProps) {
    return (
        <div className="react-batteries-overview-due-summary">
            <button
                type="button"
                className={
                    activeDue ===
                        "overdue"
                        ? "react-batteries-due-card overdue active"
                        : "react-batteries-due-card overdue"
                }
                onClick={() =>
                    onDueChange(
                        activeDue ===
                            "overdue"
                            ? "all"
                            : "overdue",
                    )
                }
            >
                <strong>
                    {summary.overdue}
                </strong>{" "}
                {summary.overdue === 1
                    ? "battery is"
                    : "batteries are"}{" "}
                overdue to be charged
            </button>

            <button
                type="button"
                className={
                    activeDue ===
                        "due_today"
                        ? "react-batteries-due-card today active"
                        : "react-batteries-due-card today"
                }
                onClick={() =>
                    onDueChange(
                        activeDue ===
                            "due_today"
                            ? "all"
                            : "due_today",
                    )
                }
            >
                <strong>
                    {summary.dueToday}
                </strong>{" "}
                {summary.dueToday === 1
                    ? "battery is"
                    : "batteries are"}{" "}
                due to be charged today
            </button>

            <button
                type="button"
                className={
                    activeDue ===
                        "due_soon"
                        ? "react-batteries-due-card soon active"
                        : "react-batteries-due-card soon"
                }
                onClick={() =>
                    onDueChange(
                        activeDue ===
                            "due_soon"
                            ? "all"
                            : "due_soon",
                    )
                }
            >
                <strong>
                    {summary.dueSoon}
                </strong>{" "}
                {summary.dueSoon === 1
                    ? "battery is"
                    : "batteries are"}{" "}
                due to be charged within
                the next{" "}
                {dueSoonDays} days
            </button>
        </div>
    );
}