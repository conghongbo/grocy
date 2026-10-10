import type { ChoreDraft, AssignmentType } from "../../domain/chores/choreForm";
interface Props { value: ChoreDraft; onChange: (value: ChoreDraft) => void; users: Array<{ id: number; display_name: string }>; enabled: boolean; }
export function ChoreAssignmentFields({ value, onChange, users, enabled }: Props) {
    if (!enabled) return null;
    const selected = value.assignment_config.split(",").filter(Boolean);
    return <fieldset className="react-chore-subsection"><legend>Assignment</legend>
        <label>Assignment type<select value={value.assignment_type} onChange={event => onChange({ ...value, assignment_type: event.target.value as AssignmentType })}>
            <option value="no-assignment">No assignment</option><option value="random">Random</option>
            <option value="in-alphabetical-order">In alphabetical order</option><option value="who-least-did-first">Who least did first</option>
        </select></label>
        {value.assignment_type !== "no-assignment" && <label>Assign to
            <select multiple value={selected} onChange={event => onChange({ ...value, assignment_config: Array.from(event.target.selectedOptions, option => option.value).join(",") })}>
                {users.map(user => <option key={user.id} value={user.id}>{user.display_name}</option>)}
            </select><small>Hold Command/Ctrl to select multiple users.</small></label>}
    </fieldset>;
}
