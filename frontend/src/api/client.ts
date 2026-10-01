const BASE_URL = "/api";

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(
            `Grocy API request failed: ${response.status}`
        );
    }

    return response.json() as Promise<T>;
}