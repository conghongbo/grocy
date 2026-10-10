import type { BatteryUserfieldDefinition } from "../../app/bootstrap";
import type { ChoreDraft } from "./choreForm";

/** Fail closed: unknown field types, complex pickers, or unsafe dates stay in Legacy. */
export const SAFE_USERFIELD_TYPES = new Set([
    "text-single-line", "text-multi-line", "number-integral", "number-decimal",
    "number-currency", "date", "datetime", "checkbox", "preset-list",
    "preset-checklist", "link",
]);

export function checkChoreCutover(args: {
    enabled: boolean;
    editing: boolean;
    editVerified: boolean;
    historyChecked: boolean;
    historyLocked: boolean;
    historyError: boolean;
    definitions: BatteryUserfieldDefinition[];
    assignmentEnabled: boolean;
    productEnabled: boolean;
    draft: ChoreDraft;
}): string[] {
    const { enabled, editing, editVerified, historyChecked, historyLocked, historyError, definitions, assignmentEnabled, productEnabled, draft } = args;
    const reasons: string[] = [];
    if (!enabled) reasons.push("React cutover is disabled");
    if (editing && (!historyChecked || historyLocked || historyError)) reasons.push("Execution history is locked or unverified");
    if (definitions.some(f => !SAFE_USERFIELD_TYPES.has(f.type))) reasons.push("Unsupported custom field type");
    // Userfield encoding and presets are not verified end-to-end yet.
    if (definitions.length) reasons.push("Custom field save parity is not verified");
    if (draft.consume_product_on_execution) reasons.push("Product picker/unit parity is not verified");
    if (draft.assignment_type !== "no-assignment" || draft.assignment_config.trim()) reasons.push("Assignment save parity is not verified");
    if (assignmentEnabled || productEnabled) reasons.push("Optional chore features require legacy until verified");
    if (draft.period_type !== "manually") reasons.push("Scheduling serialization requires legacy until verified");
    if (editing && !editVerified) reasons.push("React Edit requires separate verified opt-in");
    return reasons;
}
