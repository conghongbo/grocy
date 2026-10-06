import type {
    TaskSummary as TaskSummaryData,
} from "../../features/tasks/taskFilters";

interface TaskSummaryProps {
    summary: TaskSummaryData;
}

export function TaskSummary({
    summary,
}: TaskSummaryProps) {
    return (
        <div>
            <div>
                <strong>Overdue</strong>
                <div>{summary.overdue}</div>
                <small>
                    Tasks that need attention
                </small>
            </div>

            <div>
                <strong>Due Today</strong>
                <div>{summary.dueToday}</div>
                <small>
                    Tasks scheduled for today
                </small>
            </div>

            <div>
                <strong>Due Soon</strong>
                <div>{summary.dueSoon}</div>
                <small>
                    Within the next 5 days
                </small>
            </div>
        </div>
    );
}