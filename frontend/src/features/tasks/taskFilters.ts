import type { Task } from "../../api/tasks";

export type TaskStatusFilter =
    | "all"
    | "overdue"
    | "today"
    | "due-soon"
    | "open"
    | "completed";

export interface TaskFiltersState {
    search: string;
    status: TaskStatusFilter;
    categoryId: string;
    assignedToUserId: string;
    showDone: boolean;
}

export interface TaskSummary {
    overdue: number;
    dueToday: number;
    dueSoon: number;
}

export const DEFAULT_TASK_FILTERS:
    TaskFiltersState = {
    search: "",
    status: "all",
    categoryId: "",
    assignedToUserId: "",
    showDone: false,
};

function getDateOnly(date: Date): string {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTaskDueDate(
    task: Task,
): string | null {
    if (!task.due_date) {
        return null;
    }

    return task.due_date.slice(0, 10);
}

function getToday(): string {
    return getDateOnly(new Date());
}

function getDueSoonLimit(): string {
    const date = new Date();

    date.setDate(date.getDate() + 5);

    return getDateOnly(date);
}

export function isTaskOverdue(
    task: Task,
): boolean {
    const dueDate = getTaskDueDate(task);

    if (!dueDate || task.done === 1) {
        return false;
    }

    return dueDate < getToday();
}

export function isTaskDueToday(
    task: Task,
): boolean {
    const dueDate = getTaskDueDate(task);

    if (!dueDate || task.done === 1) {
        return false;
    }

    return dueDate === getToday();
}

export function isTaskDueSoon(
    task: Task,
): boolean {
    const dueDate = getTaskDueDate(task);

    if (!dueDate || task.done === 1) {
        return false;
    }

    const today = getToday();
    const limit = getDueSoonLimit();

    return (
        dueDate > today &&
        dueDate <= limit
    );
}

export function getTaskSummary(
    tasks: Task[],
): TaskSummary {
    return {
        overdue: tasks.filter(
            isTaskOverdue,
        ).length,

        dueToday: tasks.filter(
            isTaskDueToday,
        ).length,

        dueSoon: tasks.filter(
            isTaskDueSoon,
        ).length,
    };
}

export function filterTasks(
    tasks: Task[],
    filters: TaskFiltersState,
): Task[] {
    const search =
        filters.search
            .trim()
            .toLowerCase();

    return tasks.filter((task) => {
        if (
            !filters.showDone &&
            task.done === 1
        ) {
            return false;
        }

        if (search) {
            const searchableText = [
                task.name,
                task.description ?? "",
                task.category?.name ?? "",
                task.assigned_to_user
                    ?.display_name ?? "",
                task.assigned_to_user
                    ?.username ?? "",
            ]
                .join(" ")
                .toLowerCase();

            if (
                !searchableText.includes(
                    search,
                )
            ) {
                return false;
            }
        }

        if (
            filters.categoryId &&
            task.category_id !==
            Number(filters.categoryId)
        ) {
            return false;
        }

        if (
            filters.assignedToUserId &&
            task.assigned_to_user_id !==
            Number(
                filters.assignedToUserId,
            )
        ) {
            return false;
        }

        switch (filters.status) {
            case "overdue":
                return isTaskOverdue(task);

            case "today":
                return isTaskDueToday(task);

            case "due-soon":
                return isTaskDueSoon(task);

            case "open":
                return task.done === 0;

            case "completed":
                return task.done === 1;

            default:
                return true;
        }
    });
}