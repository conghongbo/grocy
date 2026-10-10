import { useCallback, useEffect, useRef, useState } from 'react';
import { choresApi, type Chore, type ChoreExecution } from '../../api/chores';
const message = (error: unknown) => error instanceof Error ? error.message : 'Chore request failed';
export function useChores() {
    const [chores, setChores] = useState<Chore[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [executions, setExecutions] = useState<ChoreExecution[]>([]);
    const locked = useRef(false);
    const generation = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++generation.current;
        try {
            const rows = await choresApi.current();
            if (request === generation.current) { setChores(rows); return true; }
        } catch (caught) {
            if (request === generation.current) setError(message(caught));
        } finally {
            if (request === generation.current) setLoading(false);
        }
        return false;
    }, []);
    useEffect(() => { void refresh(); return () => { ++generation.current; }; }, [refresh]);
    async function mutate(action: () => Promise<void>) {
        if (locked.current) return;
        locked.current = true;
        setBusy(true); setError(null);
        try {
            await action();
            // Preserve the undo record even if the subsequent list refresh fails.
            await refresh();
        } catch (caught) { setError(message(caught)); }
        finally { locked.current = false; setBusy(false); }
    }
    return {
        chores, loading, busy, error, executions,
        refresh: () => mutate(async () => {}),
        execute: (id: number | string) => mutate(async () => {
            const execution = await choresApi.execute(id);
            setExecutions(previous => [...previous, execution]);
        }),
        undo: (id: number | string) => mutate(async () => {
            await choresApi.undo(id);
            setExecutions(previous => previous.filter(item => String(item.id) !== String(id)));
        }),
    };
}
