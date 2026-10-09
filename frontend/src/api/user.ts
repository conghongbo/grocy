import { apiClient } from "./client";

export interface CurrentUser {
    id: number;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    picture_file_name?: string | null;
    row_created_timestamp?: string;
}

export const userApi = {
    async getCurrent(): Promise<CurrentUser> {
        const users =
            await apiClient.get<CurrentUser[]>(
                "/api/user",
            );

        const currentUser = users[0];

        if (!currentUser) {
            throw new Error(
                "Current user was not returned by Grocy.",
            );
        }

        return currentUser;
    },
};