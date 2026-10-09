import type {
    BatteryUserfieldDefinition,
} from "../../app/bootstrap";

import type {
    BatteryOverviewItem,
} from "../../domain/batteries/batteryOverview";

import {
    BatteryStateBadge,
} from "./BatteryStateBadge";

import {
    BatteryUserfieldValue,
} from "./BatteryUserfieldValue";

interface BatteriesOverviewRowProps {
    item: BatteryOverviewItem;

    userfields:
    BatteryUserfieldDefinition[];

    canTrackChargeCycle:
    boolean;

    charging:
    boolean;

    onOpenDetails: (
        item: BatteryOverviewItem,
    ) => void;

    onTrackCharge: (
        item: BatteryOverviewItem,
    ) => void;
}

function formatDateTime(
    value: string | null,
): string {
    if (
        value === null ||
        value.trim() === ""
    ) {
        return "—";
    }

    return value;
}

export function BatteriesOverviewRow({
    item,
    userfields,
    canTrackChargeCycle,
    charging,
    onOpenDetails,
    onTrackCharge,
}: BatteriesOverviewRowProps) {
    const {
        battery,
        current,
        state,
    } = item;

    const rechargeable =
        Number(
            battery.rechargeable,
        ) === 1;

    const canTrack =
        rechargeable &&
        canTrackChargeCycle;

    return (
        <tr>
            <td>
                <button
                    type="button"
                    className="react-battery-details-trigger"
                    onClick={() => {
                        onOpenDetails(
                            item,
                        );
                    }}
                >
                    {battery.name}
                </button>
            </td>

            <td>
                {rechargeable
                    ? "Rechargeable"
                    : "Single-use"}
            </td>

            <td>
                <BatteryStateBadge
                    state={state}
                />
            </td>

            <td>
                {battery.used_in?.trim()
                    ? battery.used_in
                    : "—"}
            </td>

            <td>
                {formatDateTime(
                    current.last_tracked_time,
                )}
            </td>

            <td>
                {Number(
                    battery
                        .charge_interval_days,
                ) > 0
                    ? formatDateTime(
                        current
                            .next_estimated_charge_time,
                    )
                    : "—"}
            </td>

            {userfields.map(
                (userfield) => (
                    <td
                        key={
                            userfield.id
                        }
                    >
                        <BatteryUserfieldValue
                            definition={
                                userfield
                            }
                            value={
                                battery
                                    .userfields?.[
                                userfield
                                    .name
                                ]
                            }
                        />
                    </td>
                ),
            )}

            <td>
                {canTrack ? (
                    <button
                        type="button"
                        className="btn btn-sm btn-success"
                        disabled={
                            charging
                        }
                        onClick={() => {
                            onTrackCharge(
                                item,
                            );
                        }}
                    >
                        {charging
                            ? "Tracking..."
                            : "Track charge"}
                    </button>
                ) : (
                    <span className="text-muted">
                        —
                    </span>
                )}
            </td>
        </tr>
    );
}