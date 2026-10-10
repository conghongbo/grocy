import type { ChoreStatus, ChoreSummary } from "../../domain/chores/choreOverviewFilters";

interface Props {
    summary: ChoreSummary;
    status: ChoreStatus;
    assignedUserId: number | null;
    currentUserId: number | null;
    assignmentsEnabled: boolean;
    dueSoonDays: number;
    onStatusChange: (status: ChoreStatus) => void;
    onUserChange: (id: number | null) => void;
}

export function ChoresOverviewSummary({
    summary, status, assignedUserId, currentUserId, assignmentsEnabled,
    dueSoonDays, onStatusChange, onUserChange,
}: Props) {
    const cards: Array<{ key: Exclude<ChoreStatus, "all">; label: string; count: number }> = [
        { key: "overdue", label: "Overdue", count: summary.overdue },
        { key: "duetoday", label: "Due today", count: summary.dueToday },
        ...(dueSoonDays > 0 ? [{ key: "duesoon" as const, label: "Due soon", count: summary.dueSoon }] : []),
    ];
    return (
        <div className="react-chores-summary">
            {cards.map((card) => (
                <button key={card.key} type="button"
                    className={`react-chores-summary-card ${status === card.key ? "is-active" : ""}`}
                    onClick={() => onStatusChange(status === card.key ? "all" : card.key)}>
                    <span>{card.label}</span><strong>{card.count}</strong>
                </button>
            ))}
            {assignmentsEnabled && currentUserId !== null && (
                <button type="button"
                    className={`react-chores-summary-card ${assignedUserId === currentUserId ? "is-active" : ""}`}
                    onClick={() => onUserChange(assignedUserId === currentUserId ? null : currentUserId)}>
                    <span>Assigned to me</span><strong>{summary.assignedToMe}</strong>
                </button>
            )}
        </div>
    );
}
