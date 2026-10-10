export type ChoreExecutionAction = "track-now" | "track-scheduled" | "skip";

export function createExecutionPayload(
    action: ChoreExecutionAction,
    scheduledTime: string | null,
): { tracked_time?: string; skipped?: boolean } {
    if (action === "skip") return { skipped: true };
    if (action === "track-scheduled") {
        if (!scheduledTime) throw new Error("This chore has no scheduled execution time.");
        return { tracked_time: scheduledTime };
    }
    return {};
}
