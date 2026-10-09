import type {
    BatteryOverviewItem,
} from "./batteryOverview";

export type BatteryOverviewStateFilter =
    | "all"
    | "ready"
    | "in_use"
    | "needs_charging"
    | "inactive";

export type BatteryOverviewDueFilter =
    | "all"
    | "overdue"
    | "due_today"
    | "due_soon";

export interface BatteriesOverviewFilters {
    search: string;
    state: BatteryOverviewStateFilter;
    due: BatteryOverviewDueFilter;
}

export interface BatteriesOverviewSummary {
    total: number;
    ready: number;
    inUse: number;
    needsCharging: number;
    inactive: number;
}

export interface BatteriesOverviewDueSummary {
    overdue: number;
    dueToday: number;
    dueSoon: number;
}

function normalize(
    value: string | null | undefined,
): string {
    return (value ?? "")
        .trim()
        .toLowerCase();
}

function parseDateTime(
    value: string | null,
): Date | null {
    if (!value || value.trim() === "") {
        return null;
    }

    const normalized =
        value.includes("T")
            ? value
            : value.replace(" ", "T");

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function startOfDay(
    date: Date,
): Date {
    const result = new Date(date);

    result.setHours(
        0,
        0,
        0,
        0,
    );

    return result;
}

function addDays(
    date: Date,
    days: number,
): Date {
    const result = new Date(date);

    result.setDate(
        result.getDate() + days,
    );

    return result;
}

export function getBatteryOverviewDueStatus(
    item: BatteryOverviewItem,
    dueSoonDays: number,
    now = new Date(),
): BatteryOverviewDueFilter {
    const nextCharge =
        parseDateTime(
            item.current
                .next_estimated_charge_time,
        );

    if (!nextCharge) {
        return "all";
    }

    const today =
        startOfDay(now);

    const nextChargeDay =
        startOfDay(nextCharge);

    if (
        nextChargeDay.getTime() <
        today.getTime()
    ) {
        return "overdue";
    }

    if (
        nextChargeDay.getTime() ===
        today.getTime()
    ) {
        return "due_today";
    }

    const dueSoonLimit =
        addDays(
            today,
            dueSoonDays,
        );

    if (
        nextChargeDay.getTime() <=
        dueSoonLimit.getTime()
    ) {
        return "due_soon";
    }

    return "all";
}

export function getBatteriesOverviewSummary(
    items: BatteryOverviewItem[],
): BatteriesOverviewSummary {
    return {
        total: items.length,

        ready:
            items.filter(
                (item) =>
                    item.state ===
                    "ready",
            ).length,

        inUse:
            items.filter(
                (item) =>
                    item.state ===
                    "in_use",
            ).length,

        needsCharging:
            items.filter(
                (item) =>
                    item.state ===
                    "needs_charging",
            ).length,

        inactive:
            items.filter(
                (item) =>
                    item.state ===
                    "inactive",
            ).length,
    };
}

export function getBatteriesOverviewDueSummary(
    items: BatteryOverviewItem[],
    dueSoonDays: number,
    now = new Date(),
): BatteriesOverviewDueSummary {
    let overdue = 0;
    let dueToday = 0;
    let dueSoon = 0;

    for (const item of items) {
        const status =
            getBatteryOverviewDueStatus(
                item,
                dueSoonDays,
                now,
            );

        if (status === "overdue") {
            overdue += 1;
        }

        if (status === "due_today") {
            dueToday += 1;
        }

        if (status === "due_soon") {
            dueSoon += 1;
        }
    }

    return {
        overdue,
        dueToday,
        dueSoon,
    };
}

export function filterBatteriesOverview(
    items: BatteryOverviewItem[],
    filters: BatteriesOverviewFilters,
    dueSoonDays: number,
    now = new Date(),
): BatteryOverviewItem[] {
    const search =
        normalize(filters.search);

    return items.filter(
        (item) => {
            if (
                filters.state !==
                "all" &&
                item.state !==
                filters.state
            ) {
                return false;
            }

            if (
                filters.due !==
                "all"
            ) {
                const dueStatus =
                    getBatteryOverviewDueStatus(
                        item,
                        dueSoonDays,
                        now,
                    );

                if (
                    dueStatus !==
                    filters.due
                ) {
                    return false;
                }
            }

            if (search === "") {
                return true;
            }

            const searchable =
                [
                    item.battery.name,
                    item.battery.used_in,
                    item.state,
                    item.battery.rechargeable ===
                        1
                        ? "rechargeable"
                        : "single-use",
                ]
                    .map(normalize)
                    .join(" ");

            return searchable.includes(
                search,
            );
        },
    );
}