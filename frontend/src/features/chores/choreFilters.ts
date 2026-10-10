import type { Chore } from '../../api/chores';
export type ChoreStatus = 'overdue' | 'duetoday' | 'duesoon' | 'scheduled' | 'unscheduled';
export const STATUS_LABELS = { overdue: 'Overdue', duetoday: 'Due today', duesoon: 'Due soon', scheduled: 'Scheduled', unscheduled: 'No schedule' };
export interface ChoreFilters { search: string; status: string; user: string; }
export const DEFAULT_CHORE_FILTERS: ChoreFilters = { search: '', status: 'all', user: 'all' };
// Compare server-local ISO values without converting them to the browser timezone.
export function getChoreStatus(chore: Chore, now: string, dueSoonDays: number): ChoreStatus {
    const due = chore.next_estimated_execution_time;
    if (!due) return 'unscheduled';
    if (due < now) return 'overdue';
    if (due <= now.slice(0, 10) + ' 23:59:59') return 'duetoday';
    const limit = new Date(now.replace(' ', 'T') + 'Z');
    limit.setUTCDate(limit.getUTCDate() + dueSoonDays);
    if (dueSoonDays > 0 && due <= limit.toISOString().slice(0, 19).replace('T', ' ')) return 'duesoon';
    return 'scheduled';
}
export function filterChores(chores: Chore[], filters: ChoreFilters, now: string, days: number): Chore[] {
    const search = filters.search.trim().toLocaleLowerCase();
    return chores.filter(chore =>
        chore.chore_name.toLocaleLowerCase().includes(search) &&
        (filters.status === 'all' || getChoreStatus(chore, now, days) === filters.status) &&
        (filters.user === 'all' || (filters.user === 'unassigned'
            ? chore.next_execution_assigned_to_user_id == null
            : String(chore.next_execution_assigned_to_user_id) === filters.user))
    ).sort((a, b) => (a.next_estimated_execution_time || '9999').localeCompare(b.next_estimated_execution_time || '9999') || a.chore_name.localeCompare(b.chore_name));
}
