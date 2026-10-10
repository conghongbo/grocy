import type { ChoreDraft } from "./choreForm";
export interface ChoreSaveTransport {
  create(draft: ChoreDraft): Promise<{ created_object_id: number }>;
  update(id: number, draft: ChoreDraft): Promise<unknown>;
  saveUserfields(id: number, values: Record<string, string | null>): Promise<unknown>;
  recalculate(id: number): Promise<unknown>;
}
/** Testable workflow used by React: a failure resumes at the failed step. */
export function createChoreSaveSession(transport: ChoreSaveTransport, existingId: number | null) {
  let id = existingId;
  let stage: "master" | "userfields" | "recalculate" | "done" = "master";
  const completed = new Set<string>();
  let snapshot: string | null = null;
  return {
    get state() { return { id, stage }; },
    async save(draft: ChoreDraft, changes: Record<string, string | null> = {}) {
      const serialized = JSON.stringify({ draft, changes });
      if (snapshot !== null && snapshot !== serialized) throw new Error("Draft changed during partial save; finish or reload before editing");
      snapshot ??= serialized;
      if (stage === "master") {
        if (id === null) {
          const result = await transport.create(draft);
          if (!Number.isInteger(result.created_object_id) || result.created_object_id < 1) throw new Error("Invalid created chore ID");
          id = result.created_object_id;
        } else await transport.update(id, draft);
        stage = "userfields";
      }
      if (id === null) throw new Error("Missing chore ID");
      if (stage === "userfields") {
        for (const [name, value] of Object.entries(changes)) {
          if (completed.has(name)) continue;
          await transport.saveUserfields(id, { [name]: value });
          completed.add(name);
        }
        stage = "recalculate";
      }
      if (stage === "recalculate") { await transport.recalculate(id); stage = "done"; }
      return id;
    },
  };
}
