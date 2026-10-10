import { useState } from "react";
import { choresApi } from "../../api/chores";
import { createExecutionPayload, type ChoreExecutionAction } from "../../domain/chores/choreExecution";
import { getErrorMessage } from "../../utils/errors";

export function useChoreExecution(refresh: () => Promise<void>) {
    const [busyChoreId, setBusyChoreId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    async function execute(choreId: number, action: ChoreExecutionAction, scheduledTime: string | null) {
        if (busyChoreId !== null) return;
        setBusyChoreId(choreId);
        setActionError(null);
        try {
            const payload = createExecutionPayload(action, scheduledTime);
            await choresApi.execute(choreId, payload);
            await refresh();
        } catch (error) {
            setActionError(getErrorMessage(error, "Failed to execute chore"));
        } finally {
            setBusyChoreId(null);
        }
    }
    return { execute, busyChoreId, actionError };
}
