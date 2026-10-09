import { apiClient } from "./client";

export interface Chore {
    id: number;
    name: string;
    description: string | null;

    active: number;

    period_type: string;

    track_date_only: number;

    rescheduled_date: string | null;

    rescheduled_next_execution_assigned_to_user_id:
    number | null;
}

export interface ChoreAssignedUser {
    id: number;
    username: string;
    display_name: string;
}

export interface CurrentChore {
    chore_id: number;

    last_tracked_time: string | null;

    next_estimated_execution_time: string | null;

    next_execution_assigned_to_user_id:
    number | null;

    next_execution_assigned_user:
    ChoreAssignedUser | null;

    track_date_only: number;

    is_rescheduled: number;

    is_reassigned: number;
}

export const choresApi = {
    getAll(): Promise<Chore[]> {
        return apiClient.get<Chore[]>(
            "/api/objects/chores?order=name:asc",
        );
    },

    getCurrent(): Promise<CurrentChore[]> {
        return apiClient.get<CurrentChore[]>(
            "/api/chores",
        );
    },
};