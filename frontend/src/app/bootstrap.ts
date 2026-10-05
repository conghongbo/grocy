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
    };
}

declare global {
    interface Window {
        GROCY_REACT_CONTEXT?: GrocyBootstrapContext;
    }
}

export function getBootstrapContext(): GrocyBootstrapContext {
    const context = window.GROCY_REACT_CONTEXT;

    if (!context) {
        throw new Error("Grocy React bootstrap context is missing");
    }

    return context;
}