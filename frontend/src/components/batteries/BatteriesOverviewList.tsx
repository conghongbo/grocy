import {
    BatteriesOverviewRow,
} from "./BatteriesOverviewRow";

import type {
    BatteryOverviewItem,
} from "../../features/batteries-overview/useBatteriesOverview";

interface BatteriesOverviewListProps {
    items:
    BatteryOverviewItem[];

    canTrackChargeCycle:
    boolean;

    chargingBatteryId:
    number | null;

    onOpenDetails: (
        item: BatteryOverviewItem,
    ) => void;

    onTrackCharge: (
        item: BatteryOverviewItem,
    ) => void;
}

export function BatteriesOverviewList({
    items,
    canTrackChargeCycle,
    chargingBatteryId,
    onOpenDetails,
    onTrackCharge,
}: BatteriesOverviewListProps) {
    return (
        <div className="react-batteries-overview-table-wrapper">
            <table className="table table-sm table-striped w-100 react-batteries-overview-table">
                <thead>
                    <tr>
                        <th>
                            Battery
                        </th>

                        <th>
                            Type
                        </th>

                        <th>
                            State
                        </th>

                        <th>
                            Used in
                        </th>

                        <th>
                            Last charged
                        </th>

                        <th>
                            Next planned
                            charge cycle
                        </th>

                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(
                        (item) => (
                            <BatteriesOverviewRow
                                key={
                                    item
                                        .battery
                                        .id
                                }
                                item={
                                    item
                                }
                                canTrackChargeCycle={
                                    canTrackChargeCycle
                                }
                                charging={
                                    chargingBatteryId ===
                                    item
                                        .battery
                                        .id
                                }
                                onOpenDetails={
                                    onOpenDetails
                                }
                                onTrackCharge={
                                    onTrackCharge
                                }
                            />
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}