import type {
    Battery,
} from "../../api/batteries";

interface BatteryRowProps {
    battery: Battery;

    canManage: boolean;

    canOpenTracking: boolean;

    saving: boolean;

    onTrack: (
        battery: Battery,
    ) => void;

    onEdit: (
        battery: Battery,
    ) => void;

    onDelete: (
        battery: Battery,
    ) => void;
}

export function BatteryRow({
    battery,
    canManage,
    canOpenTracking,
    saving,
    onTrack,
    onEdit,
    onDelete,
}: BatteryRowProps) {
    const isActive =
        Number(battery.active) === 1;

    const isRechargeable =
        Number(
            battery.rechargeable,
        ) === 1;

    return (
        <tr
            className={
                isActive
                    ? undefined
                    : "react-battery-row-disabled"
            }
        >
            <td>
                <span
                    className={[
                        "react-battery-status",
                        isActive
                            ? "react-battery-status-active"
                            : "react-battery-status-disabled",
                    ].join(" ")}
                >
                    {isActive
                        ? "Active"
                        : "Disabled"}
                </span>
            </td>

            <td>
                <strong>
                    {battery.name}
                </strong>

                <small className="react-battery-type-label">
                    {isRechargeable
                        ? "Rechargeable"
                        : "Single-use"}
                </small>
            </td>

            <td>
                {battery.description ||
                    "—"}
            </td>

            <td>
                {battery.used_in ||
                    "—"}
            </td>

            <td>
                {
                    battery
                        .charge_interval_days
                }
            </td>

            <td>
                <div className="react-battery-row-actions">
                    {canOpenTracking && (
                        <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={
                                saving
                            }
                            onClick={() => {
                                onTrack(
                                    battery,
                                );
                            }}
                        >
                            Track / Details
                        </button>
                    )}

                    {canManage && (
                        <>
                            <button
                                type="button"
                                className="btn btn-sm btn-info"
                                disabled={
                                    saving
                                }
                                onClick={() => {
                                    onEdit(
                                        battery,
                                    );
                                }}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                disabled={
                                    saving
                                }
                                onClick={() => {
                                    onDelete(
                                        battery,
                                    );
                                }}
                            >
                                Delete
                            </button>
                        </>
                    )}

                    {!canOpenTracking &&
                        !canManage && (
                            <span className="text-muted">
                                Read only
                            </span>
                        )}
                </div>
            </td>
        </tr>
    );
}