import type { Chore } from "../../api/chores";
export type ChoreManagementStatus = "active" | "disabled" | "all";
export function filterManagedChores(chores: Chore[], query: string, status: ChoreManagementStatus): Chore[] {
    const text = query.trim().toLocaleLowerCase();
    return chores.filter(chore =>
        (status === "all" || (status === "active" ? Number(chore.active) === 1 : Number(chore.active) !== 1)) &&
        (!text || chore.name.toLocaleLowerCase().includes(text) || (chore.description ?? "").toLocaleLowerCase().includes(text))
    );
}
