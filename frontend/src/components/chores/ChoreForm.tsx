import { useEffect, useState } from "react";
import { useChoreForm } from "../../features/chores/useChoreForm";
import { ChoreUserfields } from "./ChoreUserfields";
import { choreFormApi, type ChoreUserfieldValues } from "../../api/choreForm";
import type { BatteryUserfieldDefinition } from "../../app/bootstrap";
import { ChoreAssignmentFields } from "./ChoreAssignmentFields";
import { ChoreProductFields } from "./ChoreProductFields";
import { ChoreBasicFields } from "./ChoreBasicFields";
import { ChoreScheduleFields } from "./ChoreScheduleFields";
import { createChoreDraft, validateChoreDraft, type ChoreDraft } from "../../domain/chores/choreForm";
interface Props { cutoverEligible?: boolean; onUseLegacy?: () => void; initial?: Partial<ChoreDraft>; startDateLocked?: boolean; assignmentEnabled?: boolean; productEnabled?: boolean;
    users?: Array<{ id: number; display_name: string }>; products?: Array<{ id: number; name: string }>; canManage?: boolean; choreId?: number | null; userfieldDefinitions?: BatteryUserfieldDefinition[]; }
export function ChoreForm({ cutoverEligible = false, onUseLegacy, initial, startDateLocked = false, assignmentEnabled = false, productEnabled = false, users = [], products = [], canManage = false, choreId = null, userfieldDefinitions = [] }: Props) {
    const [draft, setDraft] = useState(() => createChoreDraft(initial));
    const [userfieldValues, setUserfieldValues] = useState<ChoreUserfieldValues>({});
    const [changedUserfields, setChangedUserfields] = useState<ChoreUserfieldValues>({});
    const [userfieldsLoading, setUserfieldsLoading] = useState(choreId !== null && userfieldDefinitions.length > 0);
    const [userfieldsError, setUserfieldsError] = useState<string | null>(null);
    useEffect(() => {
        if (choreId === null || userfieldDefinitions.length === 0) return;
        let active = true;
        choreFormApi.userfields(choreId).then(values => {
            if (active) { setUserfieldValues(values); setUserfieldsLoading(false); }
        }).catch(error => {
            if (active) { setUserfieldsError(error instanceof Error ? error.message : "Unable to load custom fields"); setUserfieldsLoading(false); }
        });
        return () => { active = false; };
    }, [choreId, userfieldDefinitions]);
    const { save, busy, error: saveError, stage, savedId } = useChoreForm(choreId);
    // Only simple types can be safely written; complex types retain legacy fallback.
    // Keep the legacy form authoritative when any custom fields exist.
    // All scheduling modes and optional assignment modes are supported by the
    // current data model. Product consumption still requires the legacy picker
    // for unit/quantity parity; never silently submit a partial product config.
    const unsupportedUserfieldTypes = new Set(["file", "image", "link-with-title"]);
    const supportedUserfields = userfieldDefinitions.every(field => !unsupportedUserfieldTypes.has(field.type) && ["text-single-line", "text-multi-line", "number-integral", "number-decimal", "number-currency", "date", "datetime", "checkbox", "preset-list", "preset-checklist", "link"].includes(field.type));
    const supportedDraft = (!draft.consume_product_on_execution || (productEnabled && products.some(p => p.id === draft.product_id) && draft.product_amount !== null && draft.product_amount > 0))
        && (assignmentEnabled || draft.assignment_type === "no-assignment")
        && (productEnabled || !draft.consume_product_on_execution);
    const safeToSave = cutoverEligible && canManage && !startDateLocked && !userfieldsLoading && !userfieldsError
        && supportedUserfields && supportedDraft;
    const errors = validateChoreDraft(draft);
    if (supportedUserfields && !userfieldsLoading) {
        for (const field of userfieldDefinitions) {
            if (field.input_required && field.type !== "checkbox" && !(userfieldValues[field.name] ?? "").trim()) errors.push(`${field.caption} is required.`);
        }
    }
    return <section className="react-chore-form"><h3>Chore Form — React 7G-7 guarded cutover</h3>
        <p>React supports basic fields, scheduling and assignments. Supported product consumption and simple custom fields can be saved. File/image and complex custom fields require Legacy.</p>
        <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0 }}><ChoreBasicFields value={draft} onChange={setDraft} />
        <ChoreScheduleFields value={draft} onChange={setDraft} startDateLocked={startDateLocked} />
        <ChoreAssignmentFields value={draft} onChange={setDraft} users={users} enabled={assignmentEnabled} />
        <ChoreProductFields value={draft} onChange={setDraft} products={products} enabled={productEnabled} />
        </fieldset>
        {userfieldsLoading && <p role="status">Loading custom fields…</p>}
        {userfieldsError && <p role="alert">Custom fields could not be loaded: {userfieldsError}. Use the legacy form below.</p>}
        {!userfieldsLoading && !userfieldsError && <ChoreUserfields definitions={userfieldDefinitions} values={userfieldValues} disabled={!canManage} onChange={(name, value) => { setUserfieldValues(previous => ({ ...previous, [name]: value })); setChangedUserfields(previous => ({ ...previous, [name]: value })); }} />}
        {errors.length > 0 && <div role="status">{errors.map(error => <p key={error}>{error}</p>)}</div>}
        {!safeToSave && <p role="status">React Save is unavailable: {!supportedUserfields ? "unsupported custom field type requires legacy saving" : startDateLocked ? "start date is locked or history is still being checked" : !canManage ? "editing permission required" : !cutoverEligible ? "React cutover is disabled or unavailable" : !supportedDraft ? "invalid or unsupported product configuration" : "custom fields are loading or failed to load"}. Use the legacy form below.</p>}
        {cutoverEligible && !supportedDraft && <p role="alert">This configuration is not supported by the safe React cutover. Switch to the legacy form before saving.</p>}
        {cutoverEligible && <button type="button" disabled={busy || (savedId !== null && choreId === null)} onClick={onUseLegacy}>Use legacy form</button>}
        {saveError && <p role="alert">Save failed at {stage}: {saveError}. {savedId !== null && choreId === null ? `Chore #${savedId} was created; retry will not create a duplicate.` : ""}</p>}
        <button type="button" disabled={!safeToSave || busy || errors.length > 0} onClick={() => void save(draft, changedUserfields)}>{busy ? "Saving…" : stage === "recalculate" ? "Retry assignment calculation" : "Save in React"}</button>
    </section>;
}
