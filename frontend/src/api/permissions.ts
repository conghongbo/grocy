import { apiClient } from "./client";

export interface PermissionHierarchyItem {
    id: number;
    name: string;
    parent: number | null;
}

export interface UserPermission {
    id: number;
    permission_id: number;
    user_id: number;
}

export const permissionsApi = {
    getHierarchy():
        Promise<PermissionHierarchyItem[]> {
        return apiClient.get<
            PermissionHierarchyItem[]
        >(
            "/api/objects/permission_hierarchy",
        );
    },

    getUserPermissions(
        userId: number,
    ): Promise<UserPermission[]> {
        return apiClient.get<
            UserPermission[]
        >(
            `/api/users/${userId}/permissions`,
        );
    },
};