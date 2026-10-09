import type {
    Battery,
} from "../../api/batteries";

export type BatteryTypeFilter =
    | "all"
    | "rechargeable"
    | "non-rechargeable";

export interface BatteryFiltersState {
    search: string;
    type: BatteryTypeFilter;
    showDisabled: boolean;
}

export interface BatterySummary {
    total: number;
    active: number;
    disabled: number;
    rechargeable: number;
}

export const DEFAULT_BATTERY_FILTERS:
    BatteryFiltersState = {
    search: "",
    type: "all",
    showDisabled: false,
};

export function getBatterySummary(
    batteries: Battery[],
): BatterySummary {
    let active = 0;
    let disabled = 0;
    let rechargeable = 0;

    for (const battery of batteries) {
        if (Number(battery.active) === 1) {
            active += 1;
        } else {
            disabled += 1;
        }

        if (
            Number(
                battery.rechargeable,
            ) === 1
        ) {
            rechargeable += 1;
        }
    }

    return {
        total: batteries.length,
        active,
        disabled,
        rechargeable,
    };
}

export function filterBatteries(
    batteries: Battery[],
    filters: BatteryFiltersState,
): Battery[] {
    const normalizedSearch =
        filters.search
            .trim()
            .toLowerCase();

    return batteries.filter(
        (battery) => {
            if (
                !filters.showDisabled &&
                Number(
                    battery.active,
                ) !== 1
            ) {
                return false;
            }

            if (
                filters.type ===
                "rechargeable" &&
                Number(
                    battery.rechargeable,
                ) !== 1
            ) {
                return false;
            }

            if (
                filters.type ===
                "non-rechargeable" &&
                Number(
                    battery.rechargeable,
                ) === 1
            ) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                battery.name,
                battery.description ?? "",
                battery.used_in ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch,
            );
        },
    );
}