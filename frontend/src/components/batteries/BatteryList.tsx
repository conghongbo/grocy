import type {
    Battery,
} from "../../api/batteries";

import {
    BatteryRow,
} from "./BatteryRow";

interface BatteryListProps {
    batteries: Battery[];

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

export function BatteryList({
    batteries,
    canManage,
    canOpenTracking,
    saving,
    onTrack,
    onEdit,
    onDelete,
}: BatteryListProps) {
    return (
        <div className="react-batteries-table-wrapper">
            <table className="react-batteries-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>
                            Description
                        </th>
                        <th>
                            Used in
                        </th>
                        <th>
                            Charge cycle
                            interval
                            (days)
                        </th>
                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {batteries.map(
                        (battery) => (
                            <BatteryRow
                                key={
                                    battery.id
                                }
                                battery={
                                    battery
                                }
                                canManage={
                                    canManage
                                }
                                canOpenTracking={
                                    canOpenTracking
                                }
                                saving={
                                    saving
                                }
                                onTrack={
                                    onTrack
                                }
                                onEdit={
                                    onEdit
                                }
                                onDelete={
                                    onDelete
                                }
                            />
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}