export const PERIOD_TYPES = ["manually", "hourly", "daily", "weekly", "monthly", "yearly", "adaptive"] as const;
export type PeriodType = typeof PERIOD_TYPES[number];
export const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export const ASSIGNMENT_TYPES = ["no-assignment", "random", "in-alphabetical-order", "who-least-did-first"] as const;
export type AssignmentType = typeof ASSIGNMENT_TYPES[number];
export interface ChoreDraft {
    assignment_type: AssignmentType;
    assignment_config: string;
    consume_product_on_execution: boolean;
    product_id: number | null;
    product_amount: number | null;
    name: string;
    description: string;
    active: boolean;
    period_type: PeriodType;
    period_days: number;
    period_interval: number;
    period_config: string;
    start_date: string;
    track_date_only: boolean;
    rollover: boolean;
}
export function createChoreDraft(source?: Partial<ChoreDraft>): ChoreDraft {
    return {
        assignment_type: source?.assignment_type ?? "no-assignment",
        assignment_config: source?.assignment_config ?? "",
        consume_product_on_execution: source?.consume_product_on_execution ?? false,
        product_id: source?.product_id ?? null,
        product_amount: source?.product_amount ?? null,
        name: source?.name ?? "", description: source?.description ?? "",
        active: source?.active ?? true, period_type: source?.period_type ?? "manually",
        period_days: source?.period_days ?? 1, period_interval: source?.period_interval ?? 1,
        period_config: source?.period_config ?? "", start_date: source?.start_date ?? "",
        track_date_only: source?.track_date_only ?? false,
        rollover: source?.rollover ?? false,
    };
}
export function validateChoreDraft(draft: ChoreDraft): string[] {
    const errors: string[] = [];
    if (!draft.name.trim()) errors.push("Name is required.");
    if (!PERIOD_TYPES.includes(draft.period_type)) errors.push("Invalid schedule type.");
    if (!["manually", "adaptive"].includes(draft.period_type) && (!Number.isInteger(draft.period_interval) || draft.period_interval < 1)) errors.push("Interval must be at least 1.");
    if (draft.period_type === "monthly" && (!Number.isInteger(draft.period_days) || draft.period_days < 1 || draft.period_days > 31)) errors.push("Day of month must be between 1 and 31.");
    if (draft.period_type === "weekly" && !draft.period_config) errors.push("Select at least one weekday.");
    if (draft.assignment_type !== "no-assignment" && !draft.assignment_config.trim()) errors.push("Select at least one assignee.");
    if (draft.consume_product_on_execution && (!draft.product_id || !draft.product_amount || draft.product_amount <= 0)) errors.push("Select a product and a positive amount.");
    if (draft.period_type === "weekly" && draft.period_config.split(",").some(day => !WEEKDAYS.includes(day as typeof WEEKDAYS[number]))) errors.push("Invalid weekday selection.");
    if (draft.start_date && Number.isNaN(Date.parse(draft.start_date.replace(" ", "T")))) errors.push("Invalid start date.");
    return errors;
}
