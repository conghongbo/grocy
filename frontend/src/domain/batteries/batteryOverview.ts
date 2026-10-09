import type {
    Battery,
    BatteryState,
    CurrentBattery,
} from "../../api/batteries";

export interface BatteryOverviewItem {
    battery: Battery;
    current: CurrentBattery;
    state: BatteryState;
}