import { apiClient } from "./client";

export interface Battery {
    id: number;
    name: string;
    description: string | null;
    used_in: string | null;
    charge_interval_days: number;
    row_created_timestamp: string;
    active: number;
    rechargeable: number;
    is_charged: number;

    userfields?: Record<
        string,
        string | null
    > | null;
}

export interface BatteryInput {
    name: string;
    description: string | null;
    used_in: string | null;
    charge_interval_days: number;
    active: number;
}

export type BatteryUserfieldValue =
    string | null;

export type BatteryUserfieldValues =
    Record<
        string,
        BatteryUserfieldValue
    >;

export interface CreateBatteryResponse {
    created_object_id: number;
}

export type BatteryState =
    | "ready"
    | "in_use"
    | "needs_charging"
    | "inactive";

export interface BatteryDetails {
    battery: Battery;
    state: BatteryState;
    last_charged: string | null;
    charge_cycles_count: number;
    next_estimated_charge_time: string | null;
}

export interface CurrentBattery {
    battery_id: number;
    last_tracked_time: string | null;
    next_estimated_charge_time: string | null;
}

export interface BatteryChargeCycleEntry {
    id: number;
    battery_id: number;
    tracked_time: string;
    undone: number;
    undone_timestamp: string | null;
    row_created_timestamp: string;
}

export interface TrackChargeCycleInput {
    tracked_time?: string;
}

export interface ReplaceBatteryInput {
    replacement_battery_id: number;
}

export interface ReplaceBatteryResponse {
    replaced_battery_id: number;
    replacement_battery_id: number;
    used_in: string;
}

export const batteriesApi = {
    getAll(): Promise<Battery[]> {
        return apiClient.get<Battery[]>(
            "/api/objects/batteries?order=name:asc",
        );
    },

    getCurrent(): Promise<CurrentBattery[]> {
        return apiClient.get<CurrentBattery[]>(
            "/api/batteries",
        );
    },

    getDetails(
        batteryId: number,
    ): Promise<BatteryDetails> {
        return apiClient.get<BatteryDetails>(
            `/api/batteries/${batteryId}`,
        );
    },

    getUserfields(
        batteryId: number,
    ): Promise<BatteryUserfieldValues> {
        return apiClient.get<
            BatteryUserfieldValues
        >(
            `/api/userfields/batteries/${batteryId}`,
        );
    },

    updateUserfields(
        batteryId: number,
        values: BatteryUserfieldValues,
    ): Promise<void> {
        return apiClient.put<void>(
            `/api/userfields/batteries/${batteryId}`,
            values,
        );
    },

    create(
        input: BatteryInput,
    ): Promise<CreateBatteryResponse> {
        return apiClient.post<CreateBatteryResponse>(
            "/api/objects/batteries",
            input,
        );
    },

    update(
        batteryId: number,
        input: BatteryInput,
    ): Promise<void> {
        return apiClient.put<void>(
            `/api/objects/batteries/${batteryId}`,
            input,
        );
    },

    delete(
        batteryId: number,
    ): Promise<void> {
        return apiClient.delete<void>(
            `/api/objects/batteries/${batteryId}`,
        );
    },

    trackChargeCycle(
        batteryId: number,
        input: TrackChargeCycleInput = {},
    ): Promise<BatteryChargeCycleEntry> {
        return apiClient.post<BatteryChargeCycleEntry>(
            `/api/batteries/${batteryId}/charge`,
            input,
        );
    },

    replaceBattery(
        batteryId: number,
        replacementBatteryId: number,
    ): Promise<ReplaceBatteryResponse> {
        return apiClient.post<ReplaceBatteryResponse>(
            `/api/batteries/${batteryId}/replace`,
            {
                replacement_battery_id:
                    replacementBatteryId,
            },
        );
    },

    undoChargeCycle(
        chargeCycleId: number,
    ): Promise<void> {
        return apiClient.post<void>(
            `/api/batteries/charge-cycles/${chargeCycleId}/undo`,
            {},
        );
    },

    getChargeHistory(
        batteryId: number,
    ): Promise<BatteryChargeCycleEntry[]> {
        return apiClient.get<
            BatteryChargeCycleEntry[]
        >(
            `/api/objects/battery_charge_cycles?query[]=battery_id=${batteryId}&order=tracked_time:desc`,
        );
    },

    getPrintLabelData(
        batteryId: number,
    ): Promise<Record<string, unknown>> {
        return apiClient.get<
            Record<string, unknown>
        >(
            `/api/batteries/${batteryId}/printlabel`,
        );
    },
};