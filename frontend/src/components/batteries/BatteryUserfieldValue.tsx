import {
    buildGrocyUrl,
    type BatteryUserfieldDefinition,
} from "../../app/bootstrap";

interface BatteryUserfieldValueProps {
    definition:
    BatteryUserfieldDefinition;

    value:
    string | null | undefined;
}

function getUserfileName(
    value: string,
): string {
    const parts =
        value.split("_");

    if (parts.length < 2) {
        return value;
    }

    try {
        return window.atob(
            parts[1],
        );
    } catch {
        return value;
    }
}

export function BatteryUserfieldValue({
    definition,
    value,
}: BatteryUserfieldValueProps) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return <>—</>;
    }

    switch (definition.type) {
        case "checkbox":
            return (
                <>
                    {value === "1"
                        ? "✓"
                        : "—"}
                </>
            );

        case "preset-checklist":
            return (
                <>
                    {value
                        .split(",")
                        .map(
                            (entry) =>
                                entry.trim(),
                        )
                        .filter(Boolean)
                        .join(", ")}
                </>
            );

        case "link":
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                >
                    {value}
                </a>
            );

        case "link-with-title": {
            let parsed: {
                title?: string;
                link?: string;
            } | null = null;

            try {
                parsed =
                    JSON.parse(
                        value,
                    ) as {
                        title?: string;
                        link?: string;
                    };
            } catch {
                parsed = null;
            }

            if (!parsed) {
                return <>{value}</>;
            }

            if (!parsed.link) {
                return <>—</>;
            }

            return (
                <a
                    href={
                        parsed.link
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    {parsed.title ||
                        parsed.link}
                </a>
            );
        }

        case "file":
            return (
                <a
                    href={buildGrocyUrl(
                        `/api/files/userfiles/${value}`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                >
                    {getUserfileName(
                        value,
                    )}
                </a>
            );

        case "image":
            return (
                <a
                    href={buildGrocyUrl(
                        `/api/files/userfiles/${value}?force_serve_as=picture`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        className="react-battery-userfield-image"
                        src={buildGrocyUrl(
                            `/api/files/userfiles/${value}?force_serve_as=picture&best_fit_width=32&best_fit_height=32`,
                        )}
                        alt={getUserfileName(
                            value,
                        )}
                        loading="lazy"
                    />
                </a>
            );

        default:
            return <>{value}</>;
    }
}