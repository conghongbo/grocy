import { useRef, useState } from "react";
import { createChoreSaveSession } from "../../domain/chores/choreSaveWorkflow";
import { choreFormApi } from "../../api/choreForm";
import { validateChoreDraft, type ChoreDraft } from "../../domain/chores/choreForm";
import { buildGrocyUrl } from "../../app/bootstrap";

type Stage = "master" | "userfields" | "recalculate" | "done";

/** Keeps the created ID and stage in refs so retries cannot create duplicate chores. */
export function useChoreForm(existingId: number | null) {
    const sessionRef = useRef<ReturnType<typeof createChoreSaveSession> | null>(null);
    if (sessionRef.current === null) sessionRef.current = createChoreSaveSession(choreFormApi, existingId);
    const busyRef = useRef(false);
    const [stage, setStage] = useState<Stage>("master");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<number | null>(existingId);
    async function save(draft: ChoreDraft, userfieldChanges: Record<string, string | null> = {}) {
        if (busyRef.current) return;
        const validation = validateChoreDraft(draft);
        if (validation.length) { setError(validation.join(" ")); return; }
        busyRef.current = true;
        setBusy(true);
        setError(null);
        try {
            await sessionRef.current!.save(draft, userfieldChanges);
            setSavedId(sessionRef.current!.state.id);
            setStage(sessionRef.current!.state.stage);
            window.location.assign(buildGrocyUrl("/chores"));
        } catch (cause) {
            setSavedId(sessionRef.current!.state.id);
            setStage(sessionRef.current!.state.stage);
            setError(cause instanceof Error ? cause.message : "Chore save failed");
        } finally { busyRef.current = false; setBusy(false); }
    }
    return { save, busy, error, stage, savedId };
}
