import type {
    PermissionHierarchyItem,
} from "../api/permissions";

export function hasPermission(
    permissionName: string,
    hierarchy: PermissionHierarchyItem[],
    grantedPermissionIds: ReadonlySet<number>,
): boolean {
    const permissionsById =
        new Map(
            hierarchy.map(
                (permission) => [
                    permission.id,
                    permission,
                ],
            ),
        );

    let current =
        hierarchy.find(
            (permission) =>
                permission.name ===
                permissionName,
        );

    const visited =
        new Set<number>();

    while (current) {
        if (
            visited.has(
                current.id,
            )
        ) {
            return false;
        }

        visited.add(
            current.id,
        );

        if (
            grantedPermissionIds.has(
                current.id,
            )
        ) {
            return true;
        }

        if (
            current.parent === null
        ) {
            return false;
        }

        current =
            permissionsById.get(
                current.parent,
            );
    }

    return false;
}