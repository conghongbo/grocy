import {
    useState,
} from "react";

import {
    batteriesApi,
} from "../../api/batteries";

import {
    getErrorMessage,
} from "../../utils/errors";

export function useBatteryLabelPrinter() {
    const [
        printingBatteryId,
        setPrintingBatteryId,
    ] =
        useState<number | null>(
            null,
        );

    const [
        printError,
        setPrintError,
    ] =
        useState<string | null>(
            null,
        );

    async function printLabel(
        batteryId: number,
    ): Promise<boolean> {
        const webhook =
            window.Grocy?.Webhooks
                ?.labelprinter;

        const runWebhook =
            window.Grocy
                ?.FrontendHelpers
                ?.RunWebhook;

        if (
            !webhook ||
            !runWebhook
        ) {
            setPrintError(
                "Label printer webhook is not available",
            );

            return false;
        }

        setPrintingBatteryId(
            batteryId,
        );

        setPrintError(null);

        try {
            const labelData =
                await batteriesApi.getPrintLabelData(
                    batteryId,
                );

            runWebhook(
                webhook,
                labelData,
            );

            return true;
        } catch (caughtError) {
            setPrintError(
                getErrorMessage(
                    caughtError,
                    "Failed to print battery Grocycode",
                ),
            );

            return false;
        } finally {
            setPrintingBatteryId(
                null,
            );
        }
    }

    return {
        printingBatteryId,
        printError,
        printLabel,
    };
}