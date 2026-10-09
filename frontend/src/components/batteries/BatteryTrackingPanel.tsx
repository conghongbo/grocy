import {
    useMemo,
    useState,
} from "react";

import type {
    Battery,
} from "../../api/batteries";

import {
    useBatteryTracking,
} from "../../features/batteries/useBatteryTracking";

import {
    BatteryStateBadge,
} from "./BatteryStateBadge";

import {
    BatteryChargeHistory,
} from "./BatteryChargeHistory";

interface BatteryTrackingPanelProps {
    battery: Battery;

    batteries: Battery[];

    canTrackChargeCycle: boolean;

    canUndoChargeCycle: boolean;

    refreshBatteries:
    () => Promise<void>;

    onClose: () => void;
}

function formatDateTime(
    value: string | null,
): string {
    if (!value) {
        return "Never";
    }

    if (
        value.startsWith(
            "2999-12-31",
        )
    ) {
        return "Not scheduled";
    }

    const normalized =
        value.includes("T")
            ? value
            : value.replace(
                " ",
                "T",
            );

    const date =
        new Date(normalized);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleString();
}

export function BatteryTrackingPanel({
    battery,
    batteries,
    canTrackChargeCycle,
    canUndoChargeCycle,
    refreshBatteries,
    onClose,
}: BatteryTrackingPanelProps) {
    const [
        replacementBatteryId,
        setReplacementBatteryId,
    ] = useState("");

    const {
        details,
        loading,
        mutating,
        error,
        refreshDetails,
        trackCharge,
        replaceBattery,
    } = useBatteryTracking(
        battery,
        refreshBatteries,
    );

    const replacementCandidates =
        useMemo(
            () =>
                batteries.filter(
                    (candidate) => {
                        if (
                            candidate.id ===
                            battery.id
                        ) {
                            return false;
                        }

                        if (
                            Number(
                                candidate.active,
                            ) !== 1
                        ) {
                            return false;
                        }

                        if (
                            candidate.used_in
                        ) {
                            return false;
                        }

                        const rechargeable =
                            Number(
                                candidate.rechargeable,
                            ) === 1;

                        if (
                            rechargeable &&
                            Number(
                                candidate.is_charged,
                            ) !== 1
                        ) {
                            return false;
                        }

                        return true;
                    },
                ),
            [
                batteries,
                battery.id,
            ],
        );

    const canReplace =
        canTrackChargeCycle &&
        Boolean(battery.used_in);

    const canTrackCharge =
        canTrackChargeCycle &&
        Number(
            battery.rechargeable,
        ) === 1;

    async function handleTrackCharge() {
        const confirmed =
            window.confirm(
                `Track a charge cycle for "${battery.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        await trackCharge();
    }

    async function handleReplace() {
        const parsedId =
            Number(
                replacementBatteryId,
            );

        if (
            !Number.isInteger(
                parsedId,
            ) ||
            parsedId <= 0
        ) {
            return;
        }

        const replacement =
            replacementCandidates.find(
                (candidate) =>
                    candidate.id ===
                    parsedId,
            );

        if (!replacement) {
            return;
        }

        const confirmed =
            window.confirm(
                `Replace "${battery.name}" with "${replacement.name}" in "${battery.used_in}"?`,
            );

        if (!confirmed) {
            return;
        }

        const success =
            await replaceBattery(
                parsedId,
            );

        if (success) {
            setReplacementBatteryId(
                "",
            );
        }
    }

    return (
        <section className="react-battery-tracking-panel">
            <header className="react-battery-tracking-header">
                <div>
                    <h3>
                        Battery tracking
                    </h3>

                    <strong>
                        {battery.name}
                    </strong>
                </div>

                <div className="react-battery-tracking-header-actions">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={
                            loading ||
                            mutating
                        }
                        onClick={() => {
                            void refreshDetails();
                        }}
                    >
                        Refresh details
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        disabled={
                            mutating
                        }
                        onClick={
                            onClose
                        }
                    >
                        Close
                    </button>
                </div>
            </header>

            {error && (
                <p className="text-danger">
                    {error}
                </p>
            )}

            {loading &&
                !details && (
                    <p className="text-muted">
                        Loading battery
                        details...
                    </p>
                )}

            {details && (
                <>
                    <div className="react-battery-tracking-details">
                        <div className="react-battery-detail-card">
                            <span>
                                State
                            </span>

                            <BatteryStateBadge
                                state={
                                    details.state
                                }
                            />
                        </div>

                        <div className="react-battery-detail-card">
                            <span>
                                Used in
                            </span>

                            <strong>
                                {details
                                    .battery
                                    .used_in ||
                                    "Not in use"}
                            </strong>
                        </div>

                        <div className="react-battery-detail-card">
                            <span>
                                Last charged
                            </span>

                            <strong>
                                {formatDateTime(
                                    details.last_charged,
                                )}
                            </strong>
                        </div>

                        <div className="react-battery-detail-card">
                            <span>
                                Charge cycles
                            </span>

                            <strong>
                                {
                                    details.charge_cycles_count
                                }
                            </strong>
                        </div>

                        <div className="react-battery-detail-card">
                            <span>
                                Next estimated charge
                            </span>

                            <strong>
                                {formatDateTime(
                                    details.next_estimated_charge_time,
                                )}
                            </strong>
                        </div>

                        <div className="react-battery-detail-card">
                            <span>
                                Battery type
                            </span>

                            <strong>
                                {Number(
                                    details
                                        .battery
                                        .rechargeable,
                                ) ===
                                    1
                                    ? "Rechargeable"
                                    : "Single-use"}
                            </strong>
                        </div>
                    </div>

                    <div className="react-battery-workflows">
                        <section className="react-battery-workflow-card">
                            <h4>
                                Charge cycle
                            </h4>

                            <p>
                                Record that
                                this battery
                                has been
                                charged.
                            </p>

                            {canTrackCharge ? (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    disabled={
                                        mutating
                                    }
                                    onClick={() => {
                                        void handleTrackCharge();
                                    }}
                                >
                                    {mutating
                                        ? "Working..."
                                        : "Track charge"}
                                </button>
                            ) : (
                                <small className="text-muted">
                                    {Number(
                                        battery.rechargeable,
                                    ) !==
                                        1
                                        ? "Charge tracking is only available for rechargeable batteries."
                                        : "You do not have permission to track charge cycles."}
                                </small>
                            )}
                        </section>

                        <section className="react-battery-workflow-card">
                            <h4>
                                Replacement
                            </h4>

                            <p>
                                Replace the
                                battery in its
                                current device.
                            </p>

                            {!battery.used_in ? (
                                <small className="text-muted">
                                    This battery
                                    is not
                                    currently
                                    assigned to
                                    a device.
                                </small>
                            ) : !canTrackChargeCycle ? (
                                <small className="text-muted">
                                    You do not
                                    have
                                    permission
                                    to replace
                                    batteries.
                                </small>
                            ) : replacementCandidates.length ===
                                0 ? (
                                <small className="text-muted">
                                    No eligible
                                    replacement
                                    batteries
                                    are
                                    available.
                                </small>
                            ) : (
                                <div className="react-battery-replacement-form">
                                    <label htmlFor="react-battery-replacement">
                                        Replacement
                                        battery
                                    </label>

                                    <select
                                        id="react-battery-replacement"
                                        className="form-control"
                                        value={
                                            replacementBatteryId
                                        }
                                        disabled={
                                            mutating ||
                                            !canReplace
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setReplacementBatteryId(
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    >
                                        <option value="">
                                            Select
                                            battery
                                        </option>

                                        {replacementCandidates.map(
                                            (
                                                candidate,
                                            ) => (
                                                <option
                                                    key={
                                                        candidate.id
                                                    }
                                                    value={
                                                        candidate.id
                                                    }
                                                >
                                                    {
                                                        candidate.name
                                                    }
                                                    {Number(
                                                        candidate.rechargeable,
                                                    ) ===
                                                        1
                                                        ? " (Rechargeable)"
                                                        : " (Single-use)"}
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        disabled={
                                            mutating ||
                                            !replacementBatteryId
                                        }
                                        onClick={() => {
                                            void handleReplace();
                                        }}
                                    >
                                        {mutating
                                            ? "Working..."
                                            : "Replace battery"}
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    <BatteryChargeHistory
                        key={`${battery.id}-${details.charge_cycles_count}`}
                        batteryId={
                            battery.id
                        }
                        canUndoChargeCycle={
                            canUndoChargeCycle
                        }
                        onHistoryChanged={
                            async () => {
                                await Promise.all([
                                    refreshDetails(),
                                    refreshBatteries(),
                                ]);
                            }
                        }
                    />
                </>
            )}
        </section>
    );
}