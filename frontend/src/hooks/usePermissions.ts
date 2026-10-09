import {
    useEffect,
    useState,
} from "react";

import {
    permissionsApi,
} from "../api/permissions";

import {
    hasPermission,
} from "../utils/permissions";

export interface UsePermissionsResult {
    has: (
        permissionName: string,
    ) => boolean;

    loadingPermissions: boolean;

    permissionError: string | null;
}

interface PermissionState {
    grantedPermissionIds:
    ReadonlySet<number>;

    hierarchy:
    Awaited<
        ReturnType<
            typeof permissionsApi.getHierarchy
        >
    >;

    loading: boolean;

    error: string | null;
}

const EMPTY_PERMISSION_IDS =
    new Set<number>();

export function usePermissions(
    userId: number | null,
): UsePermissionsResult {
    const [
        state,
        setState,
    ] = useState<PermissionState>({
        grantedPermissionIds:
            EMPTY_PERMISSION_IDS,

        hierarchy: [],

        loading:
            userId !== null,

        error: null,
    });

    useEffect(() => {
        if (userId === null) {
            return;
        }

        let cancelled = false;

        async function loadPermissions() {
            try {
                const [
                    hierarchy,
                    userPermissions,
                ] = await Promise.all([
                    permissionsApi
                        .getHierarchy(),

                    permissionsApi
                        .getUserPermissions(
                            userId as number,
                        ),
                ]);

                if (cancelled) {
                    return;
                }

                setState({
                    hierarchy,

                    grantedPermissionIds:
                        new Set(
                            userPermissions.map(
                                (
                                    permission,
                                ) =>
                                    permission
                                        .permission_id,
                            ),
                        ),

                    loading: false,

                    error: null,
                });
            } catch (
            caughtError
            ) {
                if (cancelled) {
                    return;
                }

                setState({
                    hierarchy: [],

                    grantedPermissionIds:
                        EMPTY_PERMISSION_IDS,

                    loading: false,

                    error:
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Failed to load permissions",
                });
            }
        }

        void loadPermissions();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const permissionsAvailable =
        userId !== null &&
        !state.loading &&
        state.error === null;

    function has(
        permissionName: string,
    ): boolean {
        if (!permissionsAvailable) {
            return false;
        }

        return hasPermission(
            permissionName,
            state.hierarchy,
            state.grantedPermissionIds,
        );
    }

    return {
        has,

        loadingPermissions:
            userId !== null &&
            state.loading,

        permissionError:
            userId !== null
                ? state.error
                : null,
    };
}