import { useEffect, useState } from "react";
import { ChoreForm } from "../../components/chores/ChoreForm";
import { getBootstrapContext } from "../../app/bootstrap";
import { choreFormApi } from "../../api/choreForm";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePermissions } from "../../hooks/usePermissions";
import { checkChoreCutover } from "../../domain/chores/choreCutover";
import { createChoreDraft } from "../../domain/chores/choreForm";
import { inspectEditSource } from "../../domain/chores/choreIntegrity";

export function ChoreFormPage() {
    const context = getBootstrapContext();
    const choreId = context.page.choreFormId ?? null;
    const { user, loadingUser, userError } = useCurrentUser();
    const { has, loadingPermissions, permissionError } = usePermissions(user?.id ?? null);
    const [useLegacy, setUseLegacy] = useState(false);
    const [history, setHistory] = useState<{ loading: boolean; locked: boolean; error: string | null }>({
        loading: choreId !== null, locked: choreId !== null, error: null,
    });

    useEffect(() => {
        if (choreId === null) return;
        let cancelled = false;
        choreFormApi.history(choreId).then(rows => {
            if (!cancelled) setHistory({ loading: false, locked: rows.length > 0, error: null });
        }).catch(error => {
            if (!cancelled) setHistory({ loading: false, locked: true, error: error instanceof Error ? error.message : "Unable to check execution history" });
        });
        return () => { cancelled = true; };
    }, [choreId]);

    const permissionLoading = loadingUser || (user !== null && loadingPermissions);
    const canManage = !permissionLoading && !userError && !permissionError && has("MASTER_DATA_EDIT");
    const editIntegrityIssues = choreId !== null ? inspectEditSource(context.page.choreFormInitial) : [];
    const reasons = [...checkChoreCutover({
        enabled: Boolean(context.page.choreReactCutoverEnabled),
        editing: choreId !== null,
        editVerified: Boolean(context.page.choreReactEditVerified),
        historyChecked: !history.loading,
        historyLocked: history.locked,
        historyError: Boolean(history.error),
        definitions: context.page.choreUserfields ?? [],
        assignmentEnabled: Boolean(context.page.choresAssignmentsEnabled),
        productEnabled: Boolean(context.page.choreProductConsumptionEnabled),
        draft: createChoreDraft(context.page.choreFormInitial),
    }), ...editIntegrityIssues];
    const reactPrimary = reasons.length === 0 && canManage && !useLegacy;
    useEffect(() => {
        const legacy = document.getElementById("legacy-chore-form");
        if (legacy) legacy.hidden = reactPrimary;
        return () => { if (legacy) legacy.hidden = false; };
    }, [reactPrimary]);
    return <>
        {permissionLoading && <p role="status">Checking chore permissions…</p>}
        {(userError || permissionError) && <p role="alert">Permission check failed: {userError ?? permissionError}</p>}
        {!permissionLoading && !canManage && !userError && !permissionError && <p role="alert">You do not have permission to edit chores.</p>}
        {history.loading && <p role="status">Checking chore execution history…</p>}
        {history.error && <p role="alert">Start date is locked: {history.error}</p>}
        {context.page.choreReactCutoverEnabled && reasons.length > 0 && <p role="status">Legacy form retained: {reasons.join("; ")}</p>}
        {reactPrimary && <ChoreForm
            initial={context.page.choreFormInitial}
            cutoverEligible={reactPrimary}
            onUseLegacy={() => setUseLegacy(true)}
            startDateLocked={history.locked || history.loading || Boolean(context.page.choreStartDateLocked)}
            assignmentEnabled={context.page.choresAssignmentsEnabled ?? false}
            productEnabled={context.page.choreProductConsumptionEnabled ?? false}
            users={context.page.choreUsers ?? []}
            products={context.page.choreProducts ?? []}
            canManage={canManage}
            choreId={choreId}
            userfieldDefinitions={context.page.choreUserfields ?? []}
        />}
    </>;
}
