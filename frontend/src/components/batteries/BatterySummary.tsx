import type {
    BatterySummary as BatterySummaryData,
} from "../../domain/batteries/batteryFilters";

interface BatterySummaryProps {
    summary: BatterySummaryData;
}

export function BatterySummary({
    summary,
}: BatterySummaryProps) {
    return (
        <section
            className="react-battery-summary"
            aria-label="Battery summary"
        >
            <article className="react-battery-summary-card">
                <span className="react-battery-summary-label">
                    Total
                </span>

                <strong className="react-battery-summary-value">
                    {summary.total}
                </strong>

                <small>
                    All batteries
                </small>
            </article>

            <article className="react-battery-summary-card react-battery-summary-card-active">
                <span className="react-battery-summary-label">
                    Active
                </span>

                <strong className="react-battery-summary-value">
                    {summary.active}
                </strong>

                <small>
                    Currently active
                </small>
            </article>

            <article className="react-battery-summary-card react-battery-summary-card-disabled">
                <span className="react-battery-summary-label">
                    Disabled
                </span>

                <strong className="react-battery-summary-value">
                    {summary.disabled}
                </strong>

                <small>
                    Currently disabled
                </small>
            </article>

            <article className="react-battery-summary-card react-battery-summary-card-rechargeable">
                <span className="react-battery-summary-label">
                    Rechargeable
                </span>

                <strong className="react-battery-summary-value">
                    {summary.rechargeable}
                </strong>

                <small>
                    Rechargeable batteries
                </small>
            </article>
        </section>
    );
}