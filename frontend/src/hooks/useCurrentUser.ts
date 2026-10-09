import {
    useEffect,
    useState,
} from "react";

import {
    userApi,
    type CurrentUser,
} from "../api/user";

import {
    getErrorMessage,
} from "../utils/errors";

interface UseCurrentUserResult {
    user: CurrentUser | null;
    loadingUser: boolean;
    userError: string | null;
}

export function useCurrentUser():
    UseCurrentUserResult {
    const [user, setUser] =
        useState<CurrentUser | null>(null);

    const [
        loadingUser,
        setLoadingUser,
    ] = useState(true);

    const [
        userError,
        setUserError,
    ] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function initialiseUser() {
            try {
                const result =
                    await userApi.getCurrent();

                if (cancelled) {
                    return;
                }

                setUser(result);
                setUserError(null);
            } catch (caughtError) {
                if (cancelled) {
                    return;
                }

                setUserError(
                    getErrorMessage(
                        caughtError,
                        "Failed to load current user",
                    ),
                );
            } finally {
                if (!cancelled) {
                    setLoadingUser(false);
                }
            }
        }

        void initialiseUser();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        user,
        loadingUser,
        userError,
    };
}