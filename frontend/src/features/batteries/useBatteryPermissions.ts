import {
    usePermissions,
} from "../../hooks/usePermissions";

interface UseBatteryPermissionsResult {
    canManageBatteries: boolean;

    canTrackChargeCycle: boolean;

    canUndoChargeCycle: boolean;

    loadingPermissions: boolean;

    permissionError: string | null;
}

export function useBatteryPermissions(
    userId: number | null,
): UseBatteryPermissionsResult {
    const {
        has,
        loadingPermissions,
        permissionError,
    } = usePermissions(
        userId,
    );

    return {
        canManageBatteries:
            has(
                "MASTER_DATA_EDIT",
            ),

        canTrackChargeCycle:
            has(
                "BATTERIES_TRACK_CHARGE_CYCLE",
            ),

        canUndoChargeCycle:
            has(
                "BATTERIES_UNDO_CHARGE_CYCLE",
            ),

        loadingPermissions,

        permissionError,
    };
}