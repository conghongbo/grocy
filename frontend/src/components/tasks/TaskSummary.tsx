import type {
    TaskSummary as TaskSummaryData,
} from "../../domain/tasks/taskFilters";

interface TaskSummaryProps {
    summary: TaskSummaryData;
}

export function TaskSummary({
    summary,
}: TaskSummaryProps) {
    return (
        <div className="react-task-summary-grid">
            <div
                className="
                    react-task-summary-card
                    react-task-summary-card-overdue
                "
            >
                <div className="react-task-summary-label">
                    ● Overdue
                </div>

                <div className="react-task-summary-value">
                    {summary.overdue}
                </div>

                <div className="react-task-summary-description">
                    Tasks that need attention
                </div>
            </div>

            <div
                className="
                    react-task-summary-card
                    react-task-summary-card-today
                "
            >
                <div className="react-task-summary-label">
                    ● Due Today
                </div>

                <div className="react-task-summary-value">
                    {summary.dueToday}
                </div>

                <div className="react-task-summary-description">
                    Tasks scheduled for today
                </div>
            </div>

            <div
                className="
                    react-task-summary-card
                    react-task-summary-card-soon
                "
            >
                <div className="react-task-summary-label">
                    ● Due Soon
                </div>

                <div className="react-task-summary-value">
                    {summary.dueSoon}
                </div>

                <div className="react-task-summary-description">
                    Within the next 5 days
                </div>
            </div>
        </div>
    );
}