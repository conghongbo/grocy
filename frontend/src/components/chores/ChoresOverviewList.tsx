import type {
    ChoreOverviewItem,
} from "../../domain/chores/choreOverview";

import {
    ChoresOverviewRow,
} from "./ChoresOverviewRow";

interface ChoresOverviewListProps {
    items: ChoreOverviewItem[];
}

export function ChoresOverviewList({
    items,
}: ChoresOverviewListProps) {
    if (items.length === 0) {
        return (
            <div className="chores-overview-empty">
                No chores found.
            </div>
        );
    }

    return (
        <div className="chores-overview-table-wrapper">
            <table className="chores-overview-table">
                <thead>
                    <tr>
                        <th>Chore</th>

                        <th>
                            Next estimated tracking
                        </th>

                        <th>
                            Last tracked
                        </th>

                        <th>
                            Assigned to
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => (
                        <ChoresOverviewRow
                            key={item.chore.id}
                            item={item}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}