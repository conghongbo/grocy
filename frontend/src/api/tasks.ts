import { apiClient } from "./client";

export interface Task {
    id: number;
    name: string;
    description?: string | null;
    dueDate?: string | null;
    done: boolean;
}

export interface CreateTaskInput {
    name: string;
    description?: string;
    dueDate?: string;
}

export const tasksApi = {
    getAll(): Promise<Task[]> {
        return apiClient.get<Task[]>(
            "/api/...",
        );
    },

    create(
        input: CreateTaskInput,
    ): Promise<Task> {
        return apiClient.post<Task>(
            "/api/...",
            input,
        );
    },

    complete(id: number): Promise<void> {
        return apiClient.post<void>(
            `/api/.../${id}`,
        );
    },
};