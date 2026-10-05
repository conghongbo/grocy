import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

export function mountReactPage(
    elementId: string,
    page: ReactNode,
): void {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(
            `React mount element "#${elementId}" was not found`,
        );
    }

    createRoot(element).render(
        <StrictMode>
            {page}
        </StrictMode>,
    );
}