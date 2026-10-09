import type {
    BatteryState,
} from "../../api/batteries";

interface BatteryStateBadgeProps {
    state: BatteryState;
}

const LABELS: Record<
    BatteryState,
    string
> = {
    ready: "Ready",
    in_use: "In use",
    needs_charging:
        "Needs charging",
    inactive: "Inactive",
};

export function BatteryStateBadge({
    state,
}: BatteryStateBadgeProps) {
    return (
        <span
            className={[
                "react-battery-state",
                `react-battery-state-${state.replaceAll(
                    "_",
                    "-",
                )}`,
            ].join(" ")}
        >
            {LABELS[state]}
        </span>
    );
}