import { apiClient } from "./client";

export interface TaskUser {
    id: number;
    username?: string;
    display_name?: string;
}

export interface TaskCategory {
    id: number;
    name: string;
    description?: string | null;
    row_created_timestamp?: string;
}

export interface Task {
    id: number;
    name: string;
    description: string | null;
    due_date: string | null;

    done: 0 | 1;
    done_timestamp: string | null;

    category_id: number | null;
    assigned_to_user_id: number | null;

    row_created_timestamp: string;

    assigned_to_user: TaskUser | null;
    category: TaskCategory | null;
}

export interface TaskInput {
    name: string;
    description: string;
    due_date: string | null;
    category_id: number | null;
    assigned_to_user_id: number | null;
}

export interface CreateTaskResponse {
    created_object_id: number;
}

export interface CompleteTaskInput {
    done_time?: string;
}

export const tasksApi = {
    /**
     * Returns all currently open tasks.
     *
     * Grocy:
     * GET /api/tasks
     */
    getCurrent(): Promise<Task[]> {
        return apiClient.get<Task[]>("/api/tasks");
    },

    /**
     * Marks a task as completed.
     *
     * Grocy:
     * POST /api/tasks/{taskId}/complete
     */
    complete(
        taskId: number,
        input: CompleteTaskInput = {},
    ): Promise<void> {
        return apiClient.post<void>(
            `/api/tasks/${taskId}/complete`,
            input,
        );
    },

    /**
     * Reopens a completed task.
     *
     * Grocy:
     * POST /api/tasks/{taskId}/undo
     */
    undo(taskId: number): Promise<void> {
        return apiClient.post<void>(
            `/api/tasks/${taskId}/undo`,
            {},
        );
    },

    /**
     * Creates a task using Grocy's generic entity API.
     *
     * Grocy:
     * POST /api/objects/tasks
     */
    create(
        input: TaskInput,
    ): Promise<CreateTaskResponse> {
        return apiClient.post<CreateTaskResponse>(
            "/api/objects/tasks",
            input,
        );
    },

    /**
     * Updates a task using Grocy's generic entity API.
     *
     * Grocy:
     * PUT /api/objects/tasks/{taskId}
     */
    update(
        taskId: number,
        input: TaskInput,
    ): Promise<void> {
        return apiClient.put<void>(
            `/api/objects/tasks/${taskId}`,
            input,
        );
    },

    /**
     * Deletes a task using Grocy's generic entity API.
     *
     * Grocy:
     * DELETE /api/objects/tasks/{taskId}
     */
    remove(taskId: number): Promise<void> {
        return apiClient.delete<void>(
            `/api/objects/tasks/${taskId}`,
        );
    },
};