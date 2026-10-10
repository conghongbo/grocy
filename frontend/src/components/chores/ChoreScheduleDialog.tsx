import { useState } from "react";
import type { ChoreOverviewItem } from "../../domain/chores/choreOverview";

type User = { id: number; display_name: string };
interface Props {
    item: ChoreOverviewItem;
    users: User[];
    assignmentsEnabled: boolean;
    busy: boolean;
    onClose: () => void;
    onSave: (date: string | null, userId: number | null) => Promise<boolean>;
}
function inputDate(value: string | null, dateOnly: boolean): string {
    if (!value) return "";
    return dateOnly ? value.slice(0, 10) : value.replace(" ", "T").slice(0, 16);
}
export function ChoreScheduleDialog({ item, users, assignmentsEnabled, busy, onClose, onSave }: Props) {
    const dateOnly = Number(item.chore.track_date_only) === 1;
    const [date, setDate] = useState(() => inputDate(
        item.chore.rescheduled_date ?? item.current.next_estimated_execution_time, dateOnly,
    ));
    const [userId, setUserId] = useState<string>(() =>
        item.chore.rescheduled_next_execution_assigned_to_user_id == null
            ? "" : String(item.chore.rescheduled_next_execution_assigned_to_user_id));
    async function submit(nextDate: string | null, nextUser: number | null) {
        if (await onSave(nextDate, nextUser)) onClose();
    }
    return (
        <div className="react-chore-modal-backdrop" role="presentation">
            <div className="react-chore-modal" role="dialog" aria-modal="true" aria-labelledby="react-chore-schedule-title">
                <h3 id="react-chore-schedule-title">Reschedule / Reassign: {item.chore.name}</h3>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    if (!date) return;
                    const normalized = dateOnly ? date : `${date.replace("T", " ")}:00`;
                    void submit(normalized, userId === "" ? null : Number(userId));
                }}>
                    <label>Next execution date
                        <input type={dateOnly ? "date" : "datetime-local"} required value={date}
                            onChange={(event) => setDate(event.target.value)} disabled={busy} />
                    </label>
                    {assignmentsEnabled && <label>Next assigned user
                        <select value={userId} disabled={busy} onChange={(event) => setUserId(event.target.value)}>
                            <option value="">Automatic assignment</option>
                            {users.map((user) => <option key={user.id} value={user.id}>{user.display_name}</option>)}
                        </select>
                    </label>}
                    <div className="react-chore-modal-actions">
                        <button type="submit" disabled={busy || !date}>Save</button>
                        <button type="button" disabled={busy} onClick={() => void submit(null, null)}>Clear overrides</button>
                        <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
