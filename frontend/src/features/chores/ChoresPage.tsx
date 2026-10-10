import { useMemo, useState } from "react";
import { buildGrocyUrl } from "../../app/bootstrap";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePermissions } from "../../hooks/usePermissions";
import { ChoreManagementList } from "../../components/chores/ChoreManagementList";
import { filterManagedChores, type ChoreManagementStatus } from "../../domain/chores/choreManagement";
import { useChores } from "./useChores";
export function ChoresPage() {
    const { chores, loading, error, saving, refresh, deleteChore } = useChores();
    const { user, loadingUser, userError } = useCurrentUser();
    const { has, loadingPermissions, permissionError } = usePermissions(user?.id ?? null);
    const canManage = !loadingUser && !loadingPermissions && !userError && !permissionError && has("MASTER_DATA_EDIT");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<ChoreManagementStatus>("active");
    const filtered = useMemo(() => filterManagedChores(chores, query, status), [chores, query, status]);
    const active = chores.filter(chore => Number(chore.active) === 1).length;
    async function handleDelete(chore: (typeof chores)[number]) {
        if (!canManage || !window.confirm(`Delete chore "${chore.name}"?`)) return;
        await deleteChore(chore.id);
    }
    return <section className="react-chore-management">
        <header className="react-chore-management-header"><div><h3>Chores Management (React)</h3><p>Phase 7F — safe incremental migration</p></div>
            {canManage && <a className="btn btn-primary" href={buildGrocyUrl("/chore/new")}>+ Add chore</a>}</header>
        <div className="react-chore-management-summary">
            <button type="button" onClick={() => setStatus("all")}>Total <strong>{chores.length}</strong></button>
            <button type="button" onClick={() => setStatus("active")}>Active <strong>{active}</strong></button>
            <button type="button" onClick={() => setStatus("disabled")}>Disabled <strong>{chores.length - active}</strong></button>
        </div>
        <div className="react-chore-management-filters">
            <label>Search <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chores" /></label>
            <label>Status <select value={status} onChange={e => setStatus(e.target.value as ChoreManagementStatus)}>
                <option value="active">Active</option><option value="disabled">Disabled</option><option value="all">All</option>
            </select></label>
            <button type="button" onClick={() => { setQuery(""); setStatus("active"); }}>Clear</button>
            <button type="button" disabled={saving || loading} onClick={() => { void refresh(); }}>Refresh</button>
        </div>
        {userError && <p role="alert">{userError}</p>}
        {permissionError && <p role="alert">{permissionError}</p>}
        {error && <p role="alert">{error}</p>}
        {loading ? <p>Loading chores...</p> : <ChoreManagementList chores={filtered} canManage={canManage} saving={saving} onDelete={chore => { void handleDelete(chore); }} />}
    </section>;
}
