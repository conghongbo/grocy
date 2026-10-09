import {
    useState,
    type FormEvent,
} from "react";

import type {
    Battery,
    BatteryInput,
    BatteryUserfieldValues,
} from "../../api/batteries";

import type {
    BatteryUserfieldDefinition,
} from "../../app/bootstrap";

import {
    BatteryUserfieldsForm,
} from "./BatteryUserfieldsForm";

interface BatteryFormProps {
    battery: Battery | null;

    userfieldDefinitions:
    BatteryUserfieldDefinition[];

    initialUserfieldValues:
    BatteryUserfieldValues;

    loadingUserfields:
    boolean;

    userfieldsError:
    string | null;

    saving: boolean;

    onSave: (
        input: BatteryInput,
        userfields: BatteryUserfieldValues,
    ) => Promise<boolean>;

    onCancel: () => void;
}

export function BatteryForm({
    battery,
    userfieldDefinitions,
    initialUserfieldValues,
    loadingUserfields,
    userfieldsError,
    saving,
    onSave,
    onCancel,
}: BatteryFormProps) {
    const [name, setName] =
        useState(
            battery?.name ?? "",
        );

    const [
        description,
        setDescription,
    ] = useState(
        battery?.description ?? "",
    );

    const [usedIn, setUsedIn] =
        useState(
            battery?.used_in ?? "",
        );

    const [
        chargeIntervalDays,
        setChargeIntervalDays,
    ] = useState(
        String(
            battery?.charge_interval_days ??
            0,
        ),
    );

    const [active, setActive] =
        useState(
            battery
                ? Number(battery.active) === 1
                : true,
        );

    const [
        userfieldValues,
        setUserfieldValues,
    ] =
        useState<BatteryUserfieldValues>(
            initialUserfieldValues,
        );

    function handleUserfieldChange(
        name: string,
        value: string | null,
    ) {
        setUserfieldValues(
            (current) => ({
                ...current,
                [name]: value,
            }),
        );
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        const parsedInterval =
            Number.parseInt(
                chargeIntervalDays,
                10,
            );

        const interval =
            Number.isNaN(parsedInterval)
                ? 0
                : Math.max(
                    0,
                    parsedInterval,
                );

        const success =
            await onSave(
                {
                    name: trimmedName,

                    description:
                        description.trim() ||
                        null,

                    used_in:
                        usedIn.trim() ||
                        null,

                    charge_interval_days:
                        interval,

                    active:
                        active ? 1 : 0,
                },
                userfieldValues,
            );

        if (success) {
            onCancel();
        }
    }

    return (
        <div className="card mb-3">
            <div className="card-body">
                <h3 className="card-title">
                    {battery
                        ? "Edit battery"
                        : "Add battery"}
                </h3>

                <form
                    onSubmit={(event) => {
                        void handleSubmit(
                            event,
                        );
                    }}
                >
                    <div className="form-group">
                        <label htmlFor="react-battery-name">
                            Name
                        </label>

                        <input
                            id="react-battery-name"
                            type="text"
                            className="form-control"
                            value={name}
                            required
                            autoFocus
                            disabled={
                                saving
                            }
                            onChange={(
                                event,
                            ) => {
                                setName(
                                    event
                                        .target
                                        .value,
                                );
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="react-battery-description">
                            Description
                        </label>

                        <textarea
                            id="react-battery-description"
                            className="form-control"
                            value={
                                description
                            }
                            disabled={
                                saving
                            }
                            onChange={(
                                event,
                            ) => {
                                setDescription(
                                    event
                                        .target
                                        .value,
                                );
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="react-battery-used-in">
                            Used in
                        </label>

                        <input
                            id="react-battery-used-in"
                            type="text"
                            className="form-control"
                            value={usedIn}
                            disabled={
                                saving
                            }
                            onChange={(
                                event,
                            ) => {
                                setUsedIn(
                                    event
                                        .target
                                        .value,
                                );
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="react-battery-charge-interval">
                            Charge cycle
                            interval
                            (days)
                        </label>

                        <input
                            id="react-battery-charge-interval"
                            type="number"
                            min="0"
                            step="1"
                            className="form-control"
                            value={
                                chargeIntervalDays
                            }
                            disabled={
                                saving
                            }
                            onChange={(
                                event,
                            ) => {
                                setChargeIntervalDays(
                                    event
                                        .target
                                        .value,
                                );
                            }}
                        />
                    </div>

                    {battery && (
                        <div className="form-group form-check">
                            <input
                                id="react-battery-active"
                                type="checkbox"
                                className="form-check-input"
                                checked={
                                    active
                                }
                                disabled={
                                    saving
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setActive(
                                        event
                                            .target
                                            .checked,
                                    );
                                }}
                            />

                            <label
                                htmlFor="react-battery-active"
                                className="form-check-label"
                            >
                                Active
                            </label>
                        </div>
                    )}

                    {loadingUserfields && (
                        <p className="text-muted">
                            Loading custom fields...
                        </p>
                    )}

                    {userfieldsError && (
                        <p className="text-danger">
                            {userfieldsError}
                        </p>
                    )}

                    {!loadingUserfields &&
                        !userfieldsError && (
                            <BatteryUserfieldsForm
                                definitions={
                                    userfieldDefinitions
                                }
                                values={
                                    userfieldValues
                                }
                                disabled={
                                    saving
                                }
                                onChange={
                                    handleUserfieldChange
                                }
                            />
                        )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                            saving ||
                            loadingUserfields ||
                            Boolean(
                                userfieldsError,
                            ) ||
                            !name.trim()
                        }
                    >
                        {saving
                            ? "Saving..."
                            : "Save"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary ml-2"
                        disabled={
                            saving
                        }
                        onClick={
                            onCancel
                        }
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}