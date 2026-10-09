import {
    useState,
} from "react";

import {
    batteriesApi,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

interface UseOverviewChargeTrackingResult {
    chargingBatteryId:
    number | null;

    chargeError:
    string | null;

    trackCharge: (
        batteryId: number,
    ) => Promise<boolean>;
}

export function useOverviewChargeTracking(
    refreshOverview:
        () => Promise<void>,
): UseOverviewChargeTrackingResult {
    const [
        chargingBatteryId,
        setChargingBatteryId,
    ] =
        useState<number | null>(
            null,
        );

    const [
        chargeError,
        setChargeError,
    ] =
        useState<string | null>(
            null,
        );

    async function trackCharge(
        batteryId: number,
    ): Promise<boolean> {
        setChargingBatteryId(
            batteryId,
        );

        setChargeError(null);

        try {
            await batteriesApi
                .trackChargeCycle(
                    batteryId,
                    {},
                );

            await refreshOverview();

            return true;
        } catch (caughtError) {
            setChargeError(
                getErrorMessage(
                    caughtError,
                    "Failed to track charge cycle",
                ),
            );

            return false;
        } finally {
            setChargingBatteryId(
                null,
            );
        }
    }

    return {
        chargingBatteryId,
        chargeError,
        trackCharge,
    };
}