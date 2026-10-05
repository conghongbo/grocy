import { getBootstrapContext } from "../app/bootstrap";

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const { baseUrl } = getBootstrapContext();

    const response = await fetch(
        `${baseUrl}${path}`,
        {
            ...options,

            credentials: "same-origin",

            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...options.headers,
            },
        },
    );

    if (!response.ok) {
        throw new ApiError(
            response.status,
            `Grocy API request failed (${response.status})`,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export const apiClient = {
    get<T>(path: string): Promise<T> {
        return request<T>(path);
    },

    post<T>(
        path: string,
        body?: unknown,
    ): Promise<T> {
        return request<T>(path, {
            method: "POST",
            body:
                body === undefined
                    ? undefined
                    : JSON.stringify(body),
        });
    },

    put<T>(
        path: string,
        body?: unknown,
    ): Promise<T> {
        return request<T>(path, {
            method: "PUT",
            body:
                body === undefined
                    ? undefined
                    : JSON.stringify(body),
        });
    },

    delete<T>(path: string): Promise<T> {
        return request<T>(path, {
            method: "DELETE",
        });
    },
};