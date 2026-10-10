import { useEffect, useState } from 'react';
import { getBootstrapContext } from '../../app/bootstrap';
import { ChoreList } from '../../components/chores/ChoreList';
import { useChores } from './useChores';
import { DEFAULT_CHORE_FILTERS, filterChores, getChoreStatus, STATUS_LABELS } from './choreFilters';
export interface ChoresContext {
    now: string; dueSoonDays: number; assignments: boolean;
    canExecute: boolean; canUndo: boolean;
    users: { id: number | string; display_name: string }[];
    labels: Record<string, string>;
}
export function ChoresPage({ context }: { context: ChoresContext }) {
    const { chores, loading, busy, error, executions, refresh, execute, undo } = useChores();
    const [filters, setFilters] = useState(DEFAULT_CHORE_FILTERS);
    const [clock, setClock] = useState(() => ({ now: context.now, start: Date.now() }));
    useEffect(() => {
        const start = Date.now();
        const timer = window.setInterval(() => {
            const time = new Date(new Date(context.now.replace(' ', 'T') + 'Z').getTime() + Date.now() - start);
            setClock({ now: time.toISOString().slice(0, 19).replace('T', ' '), start });
        }, 30000);
        return () => window.clearInterval(timer);
    }, [context.now]);
    const t = (text: string) => context.labels[text] || text;
    const visible = filterChores(chores, filters, clock.now, context.dueSoonDays);
    const baseUrl = getBootstrapContext().baseUrl;
    return <section className="react-chores-page" aria-busy={busy}>
        <header className="react-chores-toolbar"><h2>{t('Chores overview')}</h2><div>
            <a className="btn btn-outline-secondary" href={baseUrl + '/choresjournal'}>{t('Journal')}</a>{' '}
            <a className="btn btn-outline-secondary" href={baseUrl + '/choresoverview'}>{t('Legacy page')}</a>{' '}
            <button className="btn btn-outline-secondary" type="button" disabled={busy} onClick={() => { void refresh(); }}>{t('Refresh')}</button>
        </div></header>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="react-chores-summary">{(['overdue', 'duetoday', 'duesoon'] as const).filter(status => status !== 'duesoon' || context.dueSoonDays > 0).map(status => <button key={status} type="button" className="btn btn-outline-secondary" aria-pressed={filters.status === status} onClick={() => setFilters({ ...filters, status })}>{t(STATUS_LABELS[status])}: {chores.filter(chore => getChoreStatus(chore, clock.now, context.dueSoonDays) === status).length}</button>)}</div>
        <div className="react-chores-filters">
            <label>{t('Search')}<input className="form-control" type="search" value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} /></label>
            <label>{t('Status')}<select className="form-control" value={filters.status} onChange={event => setFilters({ ...filters, status: event.target.value })}><option value="all">{t('All')}</option>{Object.entries(STATUS_LABELS).filter(([status]) => status !== 'duesoon' || context.dueSoonDays > 0).map(([status, label]) => <option key={status} value={status}>{t(label)}</option>)}</select></label>
            {context.assignments && <label>{t('Assignment')}<select className="form-control" value={filters.user} onChange={event => setFilters({ ...filters, user: event.target.value })}><option value="all">{t('All')}</option><option value="unassigned">{t('Unassigned')}</option>{context.users.map(user => <option key={user.id} value={user.id}>{user.display_name}</option>)}</select></label>}
            <button className="btn btn-outline-secondary" type="button" onClick={() => setFilters(DEFAULT_CHORE_FILTERS)}>{t('Clear filters')}</button>
        </div>
        <div aria-live="polite">{executions.map(execution => <div key={execution.id} className="alert alert-success">{t('Chore execution tracked')}: {chores.find(chore => String(chore.chore_id) === String(execution.chore_id))?.chore_name || execution.chore_id}{' '}{context.canUndo && <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => { void undo(execution.id); }}>{t('Undo')}</button>}</div>)}</div>
        {loading ? <div role="status">{t('Loading...')}</div> : visible.length === 0 ? <p role="status">{t('No chores found')}</p> : <ChoreList chores={visible} now={clock.now} days={context.dueSoonDays} busy={busy} canExecute={context.canExecute} assignments={context.assignments} t={t} onExecute={execute} />}
    </section>;
}
