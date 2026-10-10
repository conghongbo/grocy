import type {
    ChoreOverviewItem,
} from "../../domain/chores/choreOverview";

import {
    ChoresOverviewRow,
} from "./ChoresOverviewRow";

import type { ChoreExecutionAction } from "../../domain/chores/choreExecution";

interface ChoresOverviewListProps {
    canTrack: boolean;
    busyChoreId: number | null;
    onExecute: (id: number, action: ChoreExecutionAction, time: string | null) => void;
    items: ChoreOverviewItem[];
    canSchedule: boolean;
    onSchedule: (item: ChoreOverviewItem) => void;
}

export function ChoresOverviewList({
    items, canTrack, busyChoreId, onExecute, canSchedule, onSchedule,
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
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => (
                        <ChoresOverviewRow
                            key={item.chore.id}
                            item={item}
                            canTrack={canTrack}
                            canSchedule={canSchedule}
                            onSchedule={onSchedule}
                            busy={busyChoreId !== null}
                            onExecute={onExecute}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}