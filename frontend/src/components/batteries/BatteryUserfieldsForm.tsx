import type {
    BatteryUserfieldDefinition,
} from "../../app/bootstrap";

import type {
    BatteryUserfieldValues,
} from "../../api/batteries";

interface BatteryUserfieldsFormProps {
    definitions:
    BatteryUserfieldDefinition[];

    values:
    BatteryUserfieldValues;

    disabled:
    boolean;

    onChange: (
        name: string,
        value: string | null,
    ) => void;
}

export function BatteryUserfieldsForm({
    definitions,
    values,
    disabled,
    onChange,
}: BatteryUserfieldsFormProps) {
    if (definitions.length === 0) {
        return null;
    }

    return (
        <fieldset
            className="react-battery-userfields"
            disabled={disabled}
        >
            <legend>
                Custom fields
            </legend>

            {definitions.map(
                (definition) => {
                    const value =
                        values[
                        definition.name
                        ] ?? "";

                    const inputId =
                        `react-battery-userfield-${definition.id}`;

                    switch (
                    definition.type
                    ) {
                        case "text-multi-line":
                            return (
                                <div
                                    className="form-group"
                                    key={
                                        definition.id
                                    }
                                >
                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>

                                    <textarea
                                        id={
                                            inputId
                                        }
                                        className="form-control"
                                        value={
                                            value
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    />
                                </div>
                            );

                        case "checkbox":
                            return (
                                <div
                                    className="form-group form-check"
                                    key={
                                        definition.id
                                    }
                                >
                                    <input
                                        id={
                                            inputId
                                        }
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={
                                            value ===
                                            "1"
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .checked
                                                    ? "1"
                                                    : "0",
                                            );
                                        }}
                                    />

                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                        className="form-check-label"
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>
                                </div>
                            );

                        case "number":
                            return (
                                <div
                                    className="form-group"
                                    key={
                                        definition.id
                                    }
                                >
                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>

                                    <input
                                        id={
                                            inputId
                                        }
                                        type="number"
                                        className="form-control"
                                        value={
                                            value
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    />
                                </div>
                            );

                        case "date":
                            return (
                                <div
                                    className="form-group"
                                    key={
                                        definition.id
                                    }
                                >
                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>

                                    <input
                                        id={
                                            inputId
                                        }
                                        type="date"
                                        className="form-control"
                                        value={
                                            value
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    />
                                </div>
                            );

                        case "datetime-local":
                            return (
                                <div
                                    className="form-group"
                                    key={
                                        definition.id
                                    }
                                >
                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>

                                    <input
                                        id={
                                            inputId
                                        }
                                        type="datetime-local"
                                        className="form-control"
                                        value={
                                            value
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    />
                                </div>
                            );

                        case "link":
                        case "text":
                        default:
                            return (
                                <div
                                    className="form-group"
                                    key={
                                        definition.id
                                    }
                                >
                                    <label
                                        htmlFor={
                                            inputId
                                        }
                                    >
                                        {
                                            definition.caption
                                        }
                                    </label>

                                    <input
                                        id={
                                            inputId
                                        }
                                        type={
                                            definition.type ===
                                                "link"
                                                ? "url"
                                                : "text"
                                        }
                                        className="form-control"
                                        value={
                                            value
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            onChange(
                                                definition.name,
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                    />
                                </div>
                            );
                    }
                },
            )}
        </fieldset>
    );
}