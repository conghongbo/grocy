import type {
    BatteryUserfieldDefinition,
} from "../../app/bootstrap";

import type {
    BatteryOverviewItem,
} from "../../domain/batteries/batteryOverview";

import {
    BatteriesOverviewRow,
} from "./BatteriesOverviewRow";

interface BatteriesOverviewListProps {
    items:
    BatteryOverviewItem[];

    userfields:
    BatteryUserfieldDefinition[];

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
    userfields,
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

                        {userfields.map(
                            (
                                userfield,
                            ) => (
                                <th
                                    key={
                                        userfield.id
                                    }
                                >
                                    {
                                        userfield.caption
                                    }
                                </th>
                            ),
                        )}

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
                                userfields={
                                    userfields
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