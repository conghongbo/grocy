import type { ChoreDraft } from "../../domain/chores/choreForm";
interface Props { value: ChoreDraft; onChange: (value: ChoreDraft) => void; }
export function ChoreBasicFields({ value, onChange }: Props) {
    return <fieldset className="react-chore-form-section"><legend>Basic information</legend>
        <label>Name <input required value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} /></label>
        <label>Description <textarea value={value.description} onChange={e => onChange({ ...value, description: e.target.value })} /></label>
        <label className="react-chore-checkbox"><input type="checkbox" checked={value.active} onChange={e => onChange({ ...value, active: e.target.checked })} /> Active</label>
        <label className="react-chore-checkbox"><input type="checkbox" checked={value.track_date_only} onChange={e => onChange({ ...value, track_date_only: e.target.checked })} /> Track execution date only</label>
        <label className="react-chore-checkbox"><input type="checkbox" checked={value.rollover} onChange={e => onChange({ ...value, rollover: e.target.checked })} /> Due date rollover</label>
    </fieldset>;
}
