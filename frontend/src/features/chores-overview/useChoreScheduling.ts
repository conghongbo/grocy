import { useRef, useState } from "react";
import { choresApi } from "../../api/chores";
import { getErrorMessage } from "../../utils/errors";

export function useChoreScheduling(refresh: () => Promise<void>) {
    const pending = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save(choreId: number, date: string | null, userId: number | null): Promise<boolean> {
        if (pending.current) return false;
        pending.current = true;
        setBusy(true);
        setError(null);
        try {
            await choresApi.saveSchedule(choreId, date, userId);
            await choresApi.recalculateAssignments(choreId);
            await refresh();
            return true;
        } catch (caught) {
            setError(getErrorMessage(caught, "Failed to update chore schedule"));
            return false;
        } finally {
            pending.current = false;
            setBusy(false);
        }
    }
    return { save, busy, error };
}
