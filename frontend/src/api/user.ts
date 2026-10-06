import { apiClient } from "./client";

export interface CurrentUser {
    id: number;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    is_admin?: boolean;
}

export const userApi = {
    getCurrent(): Promise<CurrentUser> {
        return apiClient.get<CurrentUser>(
            "/api/user",
        );
    },
};