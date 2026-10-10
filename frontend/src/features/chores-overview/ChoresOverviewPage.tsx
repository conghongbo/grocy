import { useState } from "react";
import type { ChoreOverviewItem } from "../../domain/chores/choreOverview";
import { ChoreScheduleDialog } from "../../components/chores/ChoreScheduleDialog";
import { useChoreScheduling } from "./useChoreScheduling";
import { getBootstrapContext } from "../../app/bootstrap";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { ChoresOverviewList } from "../../components/chores/ChoresOverviewList";
import { ChoresOverviewSummary } from "../../components/chores/ChoresOverviewSummary";
import { ChoresOverviewFilters } from "../../components/chores/ChoresOverviewFilters";
import {
    calculateChoreSummary, filterChores, type ChoreStatus,
} from "../../domain/chores/choreOverviewFilters";
import { useChoresOverview } from "./useChoresOverview";
import { useChoreExecution } from "./useChoreExecution";

export function ChoresOverviewPage() {
    const { items, loading, error, refresh } = useChoresOverview();
    const { execute, busyChoreId, actionError } = useChoreExecution(refresh);
    const scheduling = useChoreScheduling(refresh);
    const [scheduleItem, setScheduleItem] = useState<ChoreOverviewItem | null>(null);
    const context = getBootstrapContext();
    const dueSoonDays = context.page.choresDueSoonDays ?? 0;
    const assignmentsEnabled = context.page.choresAssignmentsEnabled ?? false;
    const currentUserId = context.user?.id ?? null;
    const users = context.page.choreUsers ?? [];
    // Only enable writes when the server actually supplies the permission.
    const canTrack = context.permissions.includes("CHORE_TRACK_EXECUTION");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<ChoreStatus>("all");
    const [assignedUserId, setAssignedUserId] = useState<number | null>(() => {
        const value = new URLSearchParams(window.location.search).get("user");
        return value !== null && /^\\d+$/.test(value) ? Number(value) : null;
    });
    // Snapshot once per render; no timer needed for this read-only baseline.
    const [now] = useState(() => new Date());
    const summary = calculateChoreSummary(items, dueSoonDays, currentUserId, now);
    const filteredItems = filterChores(items, search, status, assignedUserId, dueSoonDays, now);
    function changeUser(id: number | null) {
        setAssignedUserId(id);
        const url = new URL(window.location.href);
        if (id === null) url.searchParams.delete("user");
        else url.searchParams.set("user", String(id));
        window.history.replaceState(window.history.state, "", url);
    }
    function clearFilters() {
        setSearch("");
        setStatus("all");
        changeUser(null);
    }
    return (
        <section className="react-chores-overview">
            <header className="react-chores-overview-header">
                <div>
                    <h3>Chores Overview</h3>
                    <p>React implementation — Phase 7C</p>
                </div>
                {scheduleItem && <ChoreScheduleDialog
                key={scheduleItem.chore.id}
                item={scheduleItem}
                users={users}
                assignmentsEnabled={assignmentsEnabled}
                busy={scheduling.busy}
                onClose={() => setScheduleItem(null)}
                onSave={(date, userId) => scheduling.save(scheduleItem.chore.id, date, userId)}
            />}
            {!loading && !error && (
                    <span className="react-chores-overview-count">
                        {filteredItems.length} / {items.length} chores
                    </span>
                )}
            </header>
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} />}
            {scheduling.error && <div role="alert" className="react-chores-action-error">{scheduling.error}</div>}
            {actionError && <div role="alert" className="react-chores-action-error">{actionError}</div>}
            {scheduleItem && <ChoreScheduleDialog
                key={scheduleItem.chore.id}
                item={scheduleItem}
                users={users}
                assignmentsEnabled={assignmentsEnabled}
                busy={scheduling.busy}
                onClose={() => setScheduleItem(null)}
                onSave={(date, userId) => scheduling.save(scheduleItem.chore.id, date, userId)}
            />}
            {!loading && !error && (
                <>
                    <ChoresOverviewSummary
                        summary={summary} status={status}
                        assignedUserId={assignedUserId}
                        currentUserId={currentUserId}
                        assignmentsEnabled={assignmentsEnabled}
                        dueSoonDays={dueSoonDays}
                        onStatusChange={setStatus} onUserChange={changeUser}
                    />
                    <ChoresOverviewFilters
                        search={search} status={status}
                        assignedUserId={assignedUserId}
                        dueSoonDays={dueSoonDays}
                        assignmentsEnabled={assignmentsEnabled}
                        users={users}
                        onSearchChange={setSearch}
                        onStatusChange={setStatus}
                        onUserChange={changeUser}
                        onClear={clearFilters}
                    />
                    <ChoresOverviewList
                        items={filteredItems}
                        canTrack={canTrack}
                        canSchedule={context.permissions.includes("MASTER_DATA_EDIT")}
                        onSchedule={setScheduleItem}
                        busyChoreId={busyChoreId}
                        onExecute={(id, action, time) => { void execute(id, action, time); }}
                    />
                </>
            )}
        </section>
    );
}
