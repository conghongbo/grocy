import type { ChoreStatus } from "../../domain/chores/choreOverviewFilters";

interface Props {
    search: string;
    status: ChoreStatus;
    assignedUserId: number | null;
    dueSoonDays: number;
    assignmentsEnabled: boolean;
    users: Array<{ id: number; display_name: string }>;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: ChoreStatus) => void;
    onUserChange: (id: number | null) => void;
    onClear: () => void;
}

export function ChoresOverviewFilters(props: Props) {
    return (
        <div className="react-chores-filters">
            <label>Search
                <input value={props.search} placeholder="Search chores..."
                    onChange={(event) => props.onSearchChange(event.target.value)} />
            </label>
            <label>Status
                <select value={props.status}
                    onChange={(event) => props.onStatusChange(event.target.value as ChoreStatus)}>
                    <option value="all">All</option>
                    <option value="overdue">Overdue</option>
                    <option value="duetoday">Due today</option>
                    {props.dueSoonDays > 0 && <option value="duesoon">Due soon</option>}
                </select>
            </label>
            {props.assignmentsEnabled && (
                <label>Assignment
                    <select value={props.assignedUserId ?? ""}
                        onChange={(event) => props.onUserChange(event.target.value ? Number(event.target.value) : null)}>
                        <option value="">All</option>
                        {props.users.map((user) => (
                            <option key={user.id} value={user.id}>{user.display_name}</option>
                        ))}
                    </select>
                </label>
            )}
            <button type="button" onClick={props.onClear}>Clear filters</button>
        </div>
    );
}
