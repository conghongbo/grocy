import type {
    BatteryDetails,
} from "../../api/batteries";

import {
    buildGrocyUrl,
} from "../../app/bootstrap";

import {
    BatteryStateBadge,
} from "./BatteryStateBadge";

interface BatteryOverviewDetailsModalProps {
    details:
    BatteryDetails | null;

    loading:
    boolean;

    error:
    string | null;

    canManageBatteries:
    boolean;

    onClose:
    () => void;
}

function formatDateTime(
    value: string | null,
): string {
    if (
        value === null ||
        value.trim() === ""
    ) {
        return "Never";
    }

    return value;
}

export function BatteryOverviewDetailsModal({
    details,
    loading,
    error,
    canManageBatteries,
    onClose,
}: BatteryOverviewDetailsModalProps) {
    if (
        !loading &&
        !details &&
        !error
    ) {
        return null;
    }

    const battery =
        details?.battery ?? null;

    const journalUrl =
        battery
            ? buildGrocyUrl(
                `/batteriesjournal?embedded&battery=${battery.id}`,
            )
            : null;

    const editUrl =
        battery
            ? buildGrocyUrl(
                `/battery/${battery.id}?embedded`,
            )
            : null;

    const grocycodeUrl =
        battery
            ? buildGrocyUrl(
                `/battery/${battery.id}/grocycode?download=true`,
            )
            : null;

    return (
        <div
            className="react-battery-details-backdrop"
            role="presentation"
            onMouseDown={(
                event,
            ) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="react-battery-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="react-battery-details-title"
            >
                <div className="react-battery-details-header">
                    <div>
                        <h4
                            id="react-battery-details-title"
                        >
                            Battery overview
                        </h4>

                        {battery && (
                            <div className="react-battery-details-name">
                                {
                                    battery.name
                                }
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={
                            onClose
                        }
                        aria-label="Close battery details"
                    >
                        ×
                    </button>
                </div>

                <div className="react-battery-details-body">
                    {loading && (
                        <div className="react-battery-details-loading">
                            Loading battery details...
                        </div>
                    )}

                    {error && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {details &&
                        battery && (
                            <>
                                <div className="react-battery-details-state">
                                    <BatteryStateBadge
                                        state={
                                            details.state
                                        }
                                    />
                                </div>

                                <dl className="react-battery-details-grid">
                                    <div>
                                        <dt>
                                            Battery
                                        </dt>

                                        <dd>
                                            {
                                                battery.name
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Type
                                        </dt>

                                        <dd>
                                            {Number(
                                                battery.rechargeable,
                                            ) ===
                                                1
                                                ? "Rechargeable"
                                                : "Single-use"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Used in
                                        </dt>

                                        <dd>
                                            {battery.used_in?.trim()
                                                ? battery.used_in
                                                : "—"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Last charged
                                        </dt>

                                        <dd>
                                            {formatDateTime(
                                                details.last_charged,
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Charge cycles
                                        </dt>

                                        <dd>
                                            {
                                                details.charge_cycles_count
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Charge interval
                                        </dt>

                                        <dd>
                                            {Number(
                                                battery.charge_interval_days,
                                            ) >
                                                0
                                                ? `${battery.charge_interval_days} days`
                                                : "—"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Next planned charge cycle
                                        </dt>

                                        <dd>
                                            {Number(
                                                battery.charge_interval_days,
                                            ) >
                                                0
                                                ? formatDateTime(
                                                    details.next_estimated_charge_time,
                                                )
                                                : "—"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            Active
                                        </dt>

                                        <dd>
                                            {Number(
                                                battery.active,
                                            ) ===
                                                1
                                                ? "Yes"
                                                : "No"}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="react-battery-details-description">
                                    <strong>
                                        Description
                                    </strong>

                                    <p>
                                        {battery.description?.trim()
                                            ? battery.description
                                            : "No description"}
                                    </p>
                                </div>

                                <div className="react-battery-details-actions">
                                    {journalUrl && (
                                        <a
                                            className="btn btn-outline-secondary"
                                            href={
                                                journalUrl
                                            }
                                        >
                                            Battery journal
                                        </a>
                                    )}

                                    {canManageBatteries &&
                                        editUrl && (
                                            <a
                                                className="btn btn-outline-secondary"
                                                href={
                                                    editUrl
                                                }
                                            >
                                                Edit battery
                                            </a>
                                        )}

                                    {grocycodeUrl && (
                                        <a
                                            className="btn btn-outline-secondary"
                                            href={
                                                grocycodeUrl
                                            }
                                            download
                                        >
                                            Download Grocycode
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                </div>

                <div className="react-battery-details-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={
                            onClose
                        }
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}