import type {
    ChoreOverviewItem,
} from "../../domain/chores/choreOverview";

import type { ChoreExecutionAction } from "../../domain/chores/choreExecution";

interface ChoresOverviewRowProps {
    canTrack: boolean;
    busy: boolean;
    onExecute: (id: number, action: ChoreExecutionAction, time: string | null) => void;
    item: ChoreOverviewItem;
    canSchedule: boolean;
    onSchedule: (item: ChoreOverviewItem) => void;
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return "-";
    }

    return value;
}

export function ChoresOverviewRow({
    item, canTrack, busy, onExecute, canSchedule, onSchedule,
}: ChoresOverviewRowProps) {
    const {
        chore,
        current,
    } = item;

    const assignedUser =
        current.next_execution_assigned_user
            ?.display_name ?? "-";

    return (
        <tr>
            <td>
                <strong>
                    {chore.name}
                </strong>
            </td>

            <td>
                {formatDate(
                    current.next_estimated_execution_time,
                )}
            </td>

            <td>
                {formatDate(
                    current.last_tracked_time,
                )}
            </td>

            <td>
                {assignedUser}
            </td>
            <td className="react-chores-actions">
                {canSchedule && <button type="button" disabled={busy} onClick={() => onSchedule(item)}>Reschedule / Reassign</button>}
                {canTrack && (
                    <>
                        <button type="button" disabled={busy} onClick={() => onExecute(chore.id, "track-now", current.next_estimated_execution_time)}>Track now</button>
                        <button type="button" disabled={busy || !current.next_estimated_execution_time} onClick={() => onExecute(chore.id, "track-scheduled", current.next_estimated_execution_time)}>Track scheduled</button>
                        <button type="button" disabled={busy || chore.period_type === "manually"} onClick={() => onExecute(chore.id, "skip", current.next_estimated_execution_time)}>Skip</button>
                    </>
                )}
            </td>
        </tr>
    );
}