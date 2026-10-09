import {
    BatteryStateBadge,
} from "./BatteryStateBadge";

import type {
    BatteryOverviewItem,
} from "../../features/batteries-overview/useBatteriesOverview";

interface BatteriesOverviewRowProps {
    item: BatteryOverviewItem;
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
}: BatteriesOverviewRowProps) {
    const {
        battery,
        current,
        state,
    } = item;

    return (
        <tr>
            <td>
                {battery.name}
            </td>

            <td>
                {battery.rechargeable === 1
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
                {battery.charge_interval_days >
                    0
                    ? formatDateTime(
                        current.next_estimated_charge_time,
                    )
                    : "—"}
            </td>
        </tr>
    );
}