import {
    usePermissions,
} from "../../hooks/usePermissions";

interface UseTaskPermissionsResult {
    canManageTasks: boolean;

    loadingPermissions: boolean;

    permissionError: string | null;
}

export function useTaskPermissions(
    userId: number | null,
): UseTaskPermissionsResult {
    const {
        has,
        loadingPermissions,
        permissionError,
    } = usePermissions(
        userId,
    );

    return {
        canManageTasks:
            has("TASKS"),

        loadingPermissions,

        permissionError,
    };
}