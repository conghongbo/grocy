import type {
    Chore,
    CurrentChore,
} from "../../api/chores";

export interface ChoreOverviewItem {
    chore: Chore;

    current: CurrentChore;
}