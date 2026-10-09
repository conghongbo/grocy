import {
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type BatteryChargeCycleEntry,
} from "../../api/batteries";

interface BatteryChargeHistoryProps {
    batteryId: number;

    canUndoChargeCycle: boolean;

    onHistoryChanged:
    () => Promise<void>;
}

function formatDateTime(
    value: string | null,
): string {
    if (!value) {
        return "—";
    }

    const normalized =
        value.includes("T")
            ? value
            : value.replace(
                " ",
                "T",
            );

    const date =
        new Date(normalized);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleString();
}

export function BatteryChargeHistory({
    batteryId,
    canUndoChargeCycle,
    onHistoryChanged,
}: BatteryChargeHistoryProps) {
    const [
        history,
        setHistory,
    ] = useState<
        BatteryChargeCycleEntry[]
    >([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        mutatingId,
        setMutatingId,
    ] = useState<number | null>(
        null,
    );

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    useEffect(() => {
        let cancelled = false;

        async function loadInitialHistory() {
            try {
                const result =
                    await batteriesApi
                        .getChargeHistory(
                            batteryId,
                        );

                if (!cancelled) {
                    setHistory(
                        result,
                    );

                    setError(null);
                }
            } catch (caughtError) {
                if (!cancelled) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Failed to load charge history",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadInitialHistory();

        return () => {
            cancelled = true;
        };
    }, [batteryId]);

    async function refreshHistory() {
        setLoading(true);
        setError(null);

        try {
            const result =
                await batteriesApi
                    .getChargeHistory(
                        batteryId,
                    );

            setHistory(result);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to load charge history",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleUndo(
        chargeCycle:
            BatteryChargeCycleEntry,
    ) {
        if (
            Number(
                chargeCycle.undone,
            ) === 1
        ) {
            return;
        }

        if (
            !canUndoChargeCycle
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                `Undo charge cycle #${chargeCycle.id} from ${formatDateTime(
                    chargeCycle.tracked_time,
                )}?`,
            );

        if (!confirmed) {
            return;
        }

        setMutatingId(
            chargeCycle.id,
        );

        setError(null);

        try {
            await batteriesApi
                .undoChargeCycle(
                    chargeCycle.id,
                );

            await Promise.all([
                refreshHistory(),
                onHistoryChanged(),
            ]);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Failed to undo charge cycle",
            );
        } finally {
            setMutatingId(null);
        }
    }

    return (
        <section className="react-battery-charge-history">
            <header className="react-battery-charge-history-header">
                <div>
                    <h4>
                        Charge history
                    </h4>

                    <small>
                        {history.length} recorded
                        cycle
                        {history.length === 1
                            ? ""
                            : "s"}
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={
                        loading ||
                        mutatingId !== null
                    }
                    onClick={() => {
                        void refreshHistory();
                    }}
                >
                    Refresh history
                </button>
            </header>

            {error && (
                <p className="text-danger">
                    {error}
                </p>
            )}

            {loading &&
                history.length ===
                0 && (
                    <p className="text-muted">
                        Loading charge
                        history...
                    </p>
                )}

            {!loading &&
                history.length ===
                0 && (
                    <p className="text-muted">
                        No charge cycles
                        recorded.
                    </p>
                )}

            {history.length > 0 && (
                <div className="react-battery-charge-history-table-wrapper">
                    <table className="react-battery-charge-history-table">
                        <thead>
                            <tr>
                                <th>
                                    Cycle
                                </th>

                                <th>
                                    Tracked
                                    time
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Undone
                                    on
                                </th>

                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {history.map(
                                (
                                    chargeCycle,
                                ) => {
                                    const isUndone =
                                        Number(
                                            chargeCycle.undone,
                                        ) ===
                                        1;

                                    const isMutating =
                                        mutatingId ===
                                        chargeCycle.id;

                                    return (
                                        <tr
                                            key={
                                                chargeCycle.id
                                            }
                                            className={
                                                isUndone
                                                    ? "react-battery-charge-cycle-undone"
                                                    : undefined
                                            }
                                        >
                                            <td>
                                                #
                                                {
                                                    chargeCycle.id
                                                }
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    chargeCycle.tracked_time,
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={[
                                                        "react-battery-charge-cycle-status",
                                                        isUndone
                                                            ? "react-battery-charge-cycle-status-undone"
                                                            : "react-battery-charge-cycle-status-active",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {isUndone
                                                        ? "Undone"
                                                        : "Active"}
                                                </span>
                                            </td>

                                            <td>
                                                {isUndone
                                                    ? formatDateTime(
                                                        chargeCycle.undone_timestamp,
                                                    )
                                                    : "—"}
                                            </td>

                                            <td>
                                                {!isUndone &&
                                                    canUndoChargeCycle ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        disabled={
                                                            isMutating
                                                        }
                                                        onClick={() => {
                                                            void handleUndo(
                                                                chargeCycle,
                                                            );
                                                        }}
                                                    >
                                                        {isMutating
                                                            ? "Undoing..."
                                                            : "Undo"}
                                                    </button>
                                                ) : isUndone ? (
                                                    <span className="text-muted">
                                                        Undone
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">
                                                        Read
                                                        only
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}