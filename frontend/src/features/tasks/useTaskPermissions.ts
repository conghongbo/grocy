import {
    useEffect,
    useState,
} from "react";

import {
    permissionsApi,
    type PermissionHierarchyItem,
} from "../../api/permissions";

interface UseTaskPermissionsResult {
    canManageTasks: boolean;
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

export function useTaskPermissions(
    userId: number | null,
): UseTaskPermissionsResult {
    const [
        canManageTasks,
        setCanManageTasks,
    ] = useState(false);

    const [
        loadingPermissions,
        setLoadingPermissions,
    ] = useState(userId !== null);

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

                setCanManageTasks(
                    hasPermission(
                        "TASKS",
                        hierarchy,
                        grantedPermissionIds,
                    ),
                );

                setPermissionError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setCanManageTasks(false);

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

    return {
        canManageTasks,
        loadingPermissions,
        permissionError,
    };
}