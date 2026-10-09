import {
    useState,
} from "react";

import {
    batteriesApi,
    type BatteryDetails,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

interface UseBatteryOverviewDetailsResult {
    details:
    BatteryDetails | null;

    loadingDetails:
    boolean;

    detailsError:
    string | null;

    openDetails: (
        batteryId: number,
    ) => Promise<void>;

    closeDetails:
    () => void;
}

export function useBatteryOverviewDetails():
    UseBatteryOverviewDetailsResult {
    const [
        details,
        setDetails,
    ] =
        useState<BatteryDetails | null>(
            null,
        );

    const [
        loadingDetails,
        setLoadingDetails,
    ] = useState(false);

    const [
        detailsError,
        setDetailsError,
    ] =
        useState<string | null>(
            null,
        );

    async function openDetails(
        batteryId: number,
    ) {
        setLoadingDetails(true);
        setDetailsError(null);
        setDetails(null);

        try {
            const result =
                await batteriesApi.getDetails(
                    batteryId,
                );

            setDetails(result);
        } catch (caughtError) {
            setDetailsError(
                getErrorMessage(
                    caughtError,
                    "Failed to load battery details",
                ),
            );
        } finally {
            setLoadingDetails(false);
        }
    }

    function closeDetails() {
        setDetails(null);
        setDetailsError(null);
        setLoadingDetails(false);
    }

    return {
        details,
        loadingDetails,
        detailsError,
        openDetails,
        closeDetails,
    };
}