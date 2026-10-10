import type { BatteryUserfieldDefinition } from "../../app/bootstrap";
import type { ChoreUserfieldValues } from "../../api/choreForm";

interface Props {
    definitions: BatteryUserfieldDefinition[];
    values: ChoreUserfieldValues;
    disabled: boolean;
    onChange: (name: string, value: string | null) => void;
}

const unsupported = new Set(["file", "image", "link-with-title"]);
const optionsFor = (field: BatteryUserfieldDefinition) => (field.config ?? "").split(/\r?\n|\r/).map(x => x.trim()).filter(Boolean);

export function ChoreUserfields({ definitions, values, disabled, onChange }: Props) {
    if (!definitions.length) return null;
    return <fieldset className="react-chore-form-section" disabled={disabled}>
        <legend>Custom fields</legend>
        <p>Supported custom fields can be saved with React; unsupported field types require the legacy form.</p>
        {[...definitions].sort((a, b) => (a.sort_number ?? 0) - (b.sort_number ?? 0)).map(field => {
            const value = values[field.name] ?? "";
            const required = Boolean(field.input_required);
            const change = (next: string) => onChange(field.name, next);
            const label = <span>{field.caption}{required ? " *" : ""}</span>;
            if (unsupported.has(field.type)) return <div key={field.id} className="react-chore-userfield">{label}<p>Managed in legacy form ({field.type}); existing value is preserved.</p></div>;
            if (field.type === "checkbox") return <label key={field.id} className="react-chore-userfield"><input type="checkbox" checked={value === "1"} onChange={e => change(e.target.checked ? "1" : "0")} /> {label}</label>;
            if (field.type === "text-multi-line") return <label key={field.id} className="react-chore-userfield">{label}<textarea required={required} value={value} onChange={e => change(e.target.value)} /></label>;
            if (field.type === "preset-list") return <label key={field.id} className="react-chore-userfield">{label}<select required={required} value={value} onChange={e => change(e.target.value)}><option value="">Select…</option>{optionsFor(field).map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
            if (field.type === "preset-checklist") return <div key={field.id} className="react-chore-userfield">{label}<div>{optionsFor(field).map(option => <label key={option}><input type="checkbox" checked={value.split(",").includes(option)} onChange={e => { const selected = new Set(value.split(",").filter(Boolean)); if (e.target.checked) selected.add(option); else selected.delete(option); change([...selected].join(",")); }} /> {option}</label>)}</div></div>;
            const inputType = field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : field.type === "number-integral" || field.type === "number-decimal" || field.type === "number-currency" ? "number" : field.type === "link" ? "url" : "text";
            const known = ["date", "datetime", "number-integral", "number-decimal", "number-currency", "link", "text-single-line"].includes(field.type);
            if (!known) return <div key={field.id} className="react-chore-userfield">{label}<p>Unsupported field type ({field.type}); use legacy form.</p></div>;
            return <label key={field.id} className="react-chore-userfield">{label}<input type={inputType} min={inputType === "number" ? 0 : undefined} step={field.type === "number-integral" ? 1 : field.type.startsWith("number-") ? "0.0001" : undefined} required={required} value={value} onChange={e => change(e.target.value)} /></label>;
        })}
    </fieldset>;
}
