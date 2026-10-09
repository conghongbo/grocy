import type {
    ChoreOverviewItem,
} from "../../domain/chores/choreOverview";

interface ChoresOverviewRowProps {
    item: ChoreOverviewItem;
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
    item,
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
        </tr>
    );
}