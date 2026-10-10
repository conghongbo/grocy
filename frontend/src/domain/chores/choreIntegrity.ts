import type { ChoreDraft } from "./choreForm";

/** A stable, exhaustive list of fields that must survive a React edit. */
export const CHORE_FIELDS = [
  "name", "description", "active", "period_type", "period_days", "period_interval",
  "period_config", "start_date", "track_date_only", "rollover", "assignment_type",
  "assignment_config", "consume_product_on_execution", "product_id", "product_amount",
] as const satisfies ReadonlyArray<keyof ChoreDraft>;

/** Reject incomplete edit payloads instead of silently defaulting missing columns. */
export function inspectEditSource(source: Partial<ChoreDraft> | null | undefined): string[] {
  if (!source) return ["Missing edit record"];
  return CHORE_FIELDS.filter(field => !Object.prototype.hasOwnProperty.call(source, field))
    .map(field => `Missing original field: ${field}`);
}

/** Validate exact round-trip values for all fields not intentionally changed. */
export function checkUnchangedFields(before: ChoreDraft, after: ChoreDraft, changed: ReadonlyArray<keyof ChoreDraft>): string[] {
  const changedSet = new Set(changed);
  return CHORE_FIELDS.filter(field => !changedSet.has(field) && before[field] !== after[field])
    .map(field => `Unexpected modification: ${field}`);
}

/** Build a complete payload from the server record; no missing values may be defaulted. */
export function buildEditPayload(source: Partial<ChoreDraft>, patch: Partial<ChoreDraft>): ChoreDraft {
  const missing = inspectEditSource(source);
  if (missing.length) throw new Error(missing.join("; "));
  const invalidPatch = Object.keys(patch).filter(key => !(CHORE_FIELDS as readonly string[]).includes(key));
  if (invalidPatch.length) throw new Error(`Unknown edit fields: ${invalidPatch.join(", ")}`);
  return { ...source, ...patch } as ChoreDraft;
}
