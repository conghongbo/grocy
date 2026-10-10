import { apiClient } from './client';
export interface Chore {
    chore_id: number | string;
    chore_name: string;
    last_tracked_time: string | null;
    next_estimated_execution_time: string | null;
    next_execution_assigned_to_user_id: number | string | null;
    next_execution_assigned_user: { display_name: string } | null;
}
export interface ChoreExecution { id: number | string; chore_id: number | string; }
export const choresApi = {
    current: () => apiClient.get<Chore[]>('/api/chores'),
    execute: (id: number | string) => apiClient.post<ChoreExecution>('/api/chores/' + id + '/execute', {}),
    undo: (id: number | string) => apiClient.post<void>('/api/chores/executions/' + id + '/undo', {}),
};
