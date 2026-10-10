import { useCallback, useEffect, useState } from "react";
import { choresApi, type Chore } from "../../api/chores";
import { getErrorMessage } from "../../utils/errors";
export function useChores() {
    const [chores, setChores] = useState<Chore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const refresh = useCallback(async () => {
        const data = await choresApi.getAll();
        setChores(data);
    }, []);
    useEffect(() => {
        let cancelled = false;
        void choresApi.getAll().then(data => { if (!cancelled) setChores(data); })
            .catch(e => { if (!cancelled) setError(getErrorMessage(e, "Failed to load chores")); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);
    const deleteChore = async (id: number): Promise<boolean> => {
        setSaving(true); setError(null);
        try { await choresApi.deleteChore(id); await refresh(); return true; }
        catch (e) { setError(getErrorMessage(e, "Failed to delete chore")); return false; }
        finally { setSaving(false); }
    };
    return { chores, loading, error, saving, refresh, deleteChore };
}
