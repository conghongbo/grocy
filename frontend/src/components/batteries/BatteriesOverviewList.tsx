import {
    BatteriesOverviewRow,
} from "./BatteriesOverviewRow";

import type {
    BatteryOverviewItem,
} from "../../features/batteries-overview/useBatteriesOverview";

interface BatteriesOverviewListProps {
    items: BatteryOverviewItem[];
}

export function BatteriesOverviewList({
    items,
}: BatteriesOverviewListProps) {
    return (
        <div className="react-batteries-overview-table-wrapper">
            <table className="table table-sm table-striped w-100 react-batteries-overview-table">
                <thead>
                    <tr>
                        <th>Battery</th>
                        <th>Type</th>
                        <th>State</th>
                        <th>Used in</th>
                        <th>
                            Last charged
                        </th>
                        <th>
                            Next planned charge cycle
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(
                        (item) => (
                            <BatteriesOverviewRow
                                key={
                                    item.battery.id
                                }
                                item={item}
                            />
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}