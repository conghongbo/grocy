export interface BatteryUserfieldDefinition {
    id: number;
    entity: string;
    name: string;
    caption: string;
    type: string;
    show_as_column_in_tables: number;
    sort_number: number | null;
    input_required?: number | boolean;
    config?: string | null;
}

export interface GrocyBootstrapContext {
    baseUrl: string;
    locale: string;

    user: {
        id: number;
        username: string;
    } | null;

    permissions: string[];

    page: {
        name: string;
        choreFormId?: number | null;
        choreReactCutoverEnabled?: boolean;
        choreReactEditVerified?: boolean;
        choreUserfields?: BatteryUserfieldDefinition[];
        choreFormInitial?: Partial<import("../domain/chores/choreForm").ChoreDraft>;
        choreStartDateLocked?: boolean;
        choreProductConsumptionEnabled?: boolean;
        choreProducts?: Array<{ id: number; name: string }>;

        batteriesDueSoonDays?: number;
        choresDueSoonDays?: number;
        choresAssignmentsEnabled?: boolean;
        choreUsers?: Array<{ id: number; display_name: string }>;

        batteryUserfields?: BatteryUserfieldDefinition[];

        labelPrinterEnabled?: boolean;
    };
}

declare global {
    interface Window {
        GROCY_REACT_CONTEXT?: GrocyBootstrapContext;

        Grocy?: {
            Webhooks?: {
                labelprinter?: unknown;
            };

            FrontendHelpers?: {
                RunWebhook?: (
                    webhook: unknown,
                    data: Record<string, unknown>,
                ) => void;
            };
        };
    }
}

export function getBootstrapContext(): GrocyBootstrapContext {
    const context = window.GROCY_REACT_CONTEXT;

    if (!context) {
        throw new Error("Grocy React bootstrap context is missing");
    }

    return context;
}

export function buildGrocyUrl(
    path: string,
): string {
    const {
        baseUrl,
    } = getBootstrapContext();

    const normalizedBaseUrl =
        baseUrl.endsWith("/")
            ? baseUrl.slice(0, -1)
            : baseUrl;

    const normalizedPath =
        path.startsWith("/")
            ? path
            : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
}