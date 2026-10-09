import {
    useEffect,
    useState,
} from "react";

import {
    permissionsApi,
    type PermissionHierarchyItem,
} from "../../api/permissions";

interface UseBatteryPermissionsResult {
    canManageBatteries: boolean;
    canTrackChargeCycle: boolean;
    canUndoChargeCycle: boolean;
    loadingPermissions: boolean;
    permissionError: string | null;
}

function hasPermission(
    permissionName: string,
    hierarchy: PermissionHierarchyItem[],
    grantedPermissionIds: Set<number>,
): boolean {
    const target = hierarchy.find(
        (permission) =>
            permission.name === permissionName,
    );

    if (!target) {
        return false;
    }

    let current:
        | PermissionHierarchyItem
        | undefined = target;

    const visited = new Set<number>();

    while (current) {
        if (visited.has(current.id)) {
            return false;
        }

        visited.add(current.id);

        if (
            grantedPermissionIds.has(
                current.id,
            )
        ) {
            return true;
        }

        if (current.parent === null) {
            break;
        }

        current = hierarchy.find(
            (permission) =>
                permission.id ===
                current?.parent,
        );
    }

    return false;
}

export function useBatteryPermissions(
    userId: number | null,
): UseBatteryPermissionsResult {
    const [
        canManageBatteries,
        setCanManageBatteries,
    ] = useState(false);

    const [
        canTrackChargeCycle,
        setCanTrackChargeCycle,
    ] = useState(false);

    const [
        canUndoChargeCycle,
        setCanUndoChargeCycle,
    ] = useState(false);

    const [
        loadingPermissions,
        setLoadingPermissions,
    ] = useState(false);

    const [
        permissionError,
        setPermissionError,
    ] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) {
            return;
        }

        let cancelled = false;

        async function initialisePermissions() {
            setLoadingPermissions(true);

            try {
                const [
                    hierarchy,
                    userPermissions,
                ] = await Promise.all([
                    permissionsApi.getHierarchy(),

                    permissionsApi
                        .getUserPermissions(
                            userId as number,
                        ),
                ]);

                if (cancelled) {
                    return;
                }

                const grantedPermissionIds =
                    new Set(
                        userPermissions.map(
                            (permission) =>
                                permission
                                    .permission_id,
                        ),
                    );

                setCanManageBatteries(
                    hasPermission(
                        "MASTER_DATA_EDIT",
                        hierarchy,
                        grantedPermissionIds,
                    ),
                );

                setCanTrackChargeCycle(
                    hasPermission(
                        "BATTERIES_TRACK_CHARGE_CYCLE",
                        hierarchy,
                        grantedPermissionIds,
                    ),
                );

                setCanUndoChargeCycle(
                    hasPermission(
                        "BATTERIES_UNDO_CHARGE_CYCLE",
                        hierarchy,
                        grantedPermissionIds,
                    ),
                );

                setPermissionError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setCanManageBatteries(false);
                setCanTrackChargeCycle(false);
                setCanUndoChargeCycle(false);

                setPermissionError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Failed to load permissions",
                );
            } finally {
                if (!cancelled) {
                    setLoadingPermissions(false);
                }
            }
        }

        void initialisePermissions();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const permissionsAvailable =
        userId !== null;

    return {
        canManageBatteries:
            permissionsAvailable &&
            canManageBatteries,

        canTrackChargeCycle:
            permissionsAvailable &&
            canTrackChargeCycle,

        canUndoChargeCycle:
            permissionsAvailable &&
            canUndoChargeCycle,

        loadingPermissions:
            permissionsAvailable &&
            loadingPermissions,

        permissionError:
            permissionsAvailable
                ? permissionError
                : null,
    };
}