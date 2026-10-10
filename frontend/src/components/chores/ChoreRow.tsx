import type { Chore } from '../../api/chores';
import { getChoreStatus, STATUS_LABELS } from '../../features/chores/choreFilters';
export interface ChoreRowProps {
    chore: Chore; now: string; days: number; busy: boolean; canExecute: boolean;
    assignments: boolean; t: (text: string) => string;
    onExecute: (id: number | string) => Promise<void>;
}
export function ChoreRow({ chore, now, days, busy, canExecute, assignments, t, onExecute }: ChoreRowProps) {
    const status = getChoreStatus(chore, now, days);
    return <tr>
        <td>{canExecute && <button type="button" className="btn btn-sm btn-success" disabled={busy} aria-label={t('Track chore execution') + ': ' + chore.chore_name} onClick={() => { void onExecute(chore.chore_id); }}>{t('Track chore execution')}</button>}</td>
        <th scope="row">{chore.chore_name}</th>
        <td>{status === 'unscheduled' ? '—' : chore.next_estimated_execution_time}<br /><span className={'react-chore-status ' + status}>{t(STATUS_LABELS[status])}</span></td>
        <td>{chore.last_tracked_time || t('Never')}</td>
        {assignments && <td>{chore.next_execution_assigned_user?.display_name || '—'}</td>}
    </tr>;
}
