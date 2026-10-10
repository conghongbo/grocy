import type { ChoreOverviewItem } from "./choreOverview";

export type ChoreStatus = "all" | "overdue" | "duetoday" | "duesoon";

export interface ChoreSummary {
    overdue: number;
    dueToday: number;
    dueSoon: number;
    assignedToMe: number;
}

function parseLocalDate(value: string | null): Date | null {
    if (!value) return null;
    const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:[ T](\\d{2}):(\\d{2})(?::(\\d{2}))?)?/);
    if (!match) return null;
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
    const date = new Date(+year, +month - 1, +day, +hour, +minute, +second);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function getChoreStatus(
    item: ChoreOverviewItem,
    dueSoonDays: number,
    now: Date,
): Exclude<ChoreStatus, "all"> | "notdue" {
    const date = parseLocalDate(item.current.next_estimated_execution_time);
    if (!date) return "notdue";
    if (date.getTime() < now.getTime()) return "overdue";
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    if (date.getTime() <= todayEnd.getTime()) return "duetoday";
    if (dueSoonDays > 0) {
        const threshold = new Date(now);
        threshold.setDate(threshold.getDate() + dueSoonDays);
        if (date.getTime() <= threshold.getTime()) return "duesoon";
    }
    return "notdue";
}

export function calculateChoreSummary(
    items: ChoreOverviewItem[],
    dueSoonDays: number,
    currentUserId: number | null,
    now: Date,
): ChoreSummary {
    const summary: ChoreSummary = {
        overdue: 0, dueToday: 0, dueSoon: 0, assignedToMe: 0,
    };
    for (const item of items) {
        const status = getChoreStatus(item, dueSoonDays, now);
        if (status === "overdue") summary.overdue++;
        if (status === "duetoday") {
            summary.dueToday++;
            summary.dueSoon++; // Legacy summary counts today's chores as due soon.
        }
        if (status === "duesoon") summary.dueSoon++;
        if (currentUserId !== null &&
            item.current.next_execution_assigned_to_user_id === currentUserId) {
            summary.assignedToMe++;
        }
    }
    return summary;
}

export function filterChores(
    items: ChoreOverviewItem[],
    search: string,
    status: ChoreStatus,
    assignedUserId: number | null,
    dueSoonDays: number,
    now: Date,
): ChoreOverviewItem[] {
    const query = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
        if (query && !item.chore.name.toLocaleLowerCase().includes(query)) return false;
        if (assignedUserId !== null &&
            item.current.next_execution_assigned_to_user_id !== assignedUserId) return false;
        if (status === "all") return true;
        const due = getChoreStatus(item, dueSoonDays, now);
        return status === "duesoon"
            ? due === "duesoon" || due === "duetoday"
            : due === status;
    });
}
