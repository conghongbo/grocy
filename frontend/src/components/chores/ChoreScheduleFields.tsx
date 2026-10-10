import { PERIOD_TYPES, WEEKDAYS, type ChoreDraft, type PeriodType } from "../../domain/chores/choreForm";
interface Props { value: ChoreDraft; onChange: (value: ChoreDraft) => void; startDateLocked: boolean; }
export function ChoreScheduleFields({ value, onChange, startDateLocked }: Props) {
    const weekdays = value.period_config.split(",").filter(Boolean);
    function changePeriod(type: PeriodType) {
        onChange({ ...value, period_type: type, period_days: type === "monthly" ? Math.max(1, value.period_days) : 1,
            period_interval: type === "manually" || type === "adaptive" ? 1 : value.period_interval,
            period_config: type === "weekly" ? value.period_config : "" });
    }
    return <fieldset className="react-chore-form-section"><legend>Scheduling</legend>
        <label>Period type <select value={value.period_type} onChange={e => changePeriod(e.target.value as PeriodType)}>
            {PERIOD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select></label>
        {!["manually", "adaptive"].includes(value.period_type) && <label>Interval
            <input type="number" min={1} step={1} value={value.period_interval} onChange={e => onChange({ ...value, period_interval: Number(e.target.value) })} />
        </label>}
        {value.period_type === "monthly" && <label>Day of month
            <input type="number" min={1} max={31} value={value.period_days} onChange={e => onChange({ ...value, period_days: Number(e.target.value) })} />
        </label>}
        {value.period_type === "weekly" && <div><span>Weekdays</span><div className="react-chore-weekdays">
            {WEEKDAYS.map(day => <label key={day}><input type="checkbox" checked={weekdays.includes(day)} onChange={e => {
                const next = e.target.checked ? [...weekdays, day] : weekdays.filter(v => v !== day);
                onChange({ ...value, period_config: WEEKDAYS.filter(v => next.includes(v)).join(",") });
            }} />{day}</label>)}
        </div></div>}
        <label>Start date <input type="datetime-local" value={value.start_date.replace(" ", "T").slice(0, 16)} disabled={startDateLocked}
            onChange={e => onChange({ ...value, start_date: e.target.value.replace("T", " ") + ":00" })} /></label>
        {startDateLocked && <small>Start date is locked because this chore has execution history.</small>}
        {value.period_type === "manually" && <p>Manual chores have no scheduled next execution.</p>}
        {value.period_type === "adaptive" && <p>Scheduling is calculated by the backend using past execution history.</p>}
    </fieldset>;
}
