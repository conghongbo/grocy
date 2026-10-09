import {
    useEffect,
    useState,
} from "react";

import {
    batteriesApi,
    type Battery,
    type BatteryInput,
    type BatteryUserfieldValues,
} from "../../api/batteries";

import type {
    BatteryUserfieldDefinition,
} from "../../app/bootstrap";

import {
    BatteryForm,
} from "../../components/batteries/BatteryForm";

import {
    getErrorMessage,
} from "../../utils/errors";

interface BatteryEditFormProps {
    battery: Battery;

    userfieldDefinitions:
    BatteryUserfieldDefinition[];

    saving: boolean;

    onSave: (
        input: BatteryInput,
        userfields:
            BatteryUserfieldValues,
    ) => Promise<boolean>;

    onCancel: () => void;
}

export function BatteryEditForm({
    battery,
    userfieldDefinitions,
    saving,
    onSave,
    onCancel,
}: BatteryEditFormProps) {
    const [
        userfieldValues,
        setUserfieldValues,
    ] =
        useState<BatteryUserfieldValues | null>(
            null,
        );

    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null,
        );

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const result =
                    await batteriesApi.getUserfields(
                        battery.id,
                    );

                if (!cancelled) {
                    setUserfieldValues(
                        result ?? {},
                    );
                }
            } catch (caughtError) {
                if (!cancelled) {
                    setError(
                        getErrorMessage(
                            caughtError,
                            "Failed to load battery custom fields",
                        ),
                    );
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [battery.id]);

    if (error) {
        return (
            <div className="card mb-3">
                <div className="card-body">
                    <p className="text-danger">
                        {error}
                    </p>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={
                            onCancel
                        }
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (userfieldValues === null) {
        return (
            <div className="card mb-3">
                <div className="card-body">
                    <p className="text-muted mb-0">
                        Loading custom fields...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <BatteryForm
            battery={
                battery
            }
            userfieldDefinitions={
                userfieldDefinitions
            }
            initialUserfieldValues={
                userfieldValues
            }
            loadingUserfields={false}
            userfieldsError={null}
            saving={
                saving
            }
            onSave={
                onSave
            }
            onCancel={
                onCancel
            }
        />
    );
}