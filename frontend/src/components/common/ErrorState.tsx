interface ErrorStateProps {
    message: string;
}

export function ErrorState({
    message,
}: ErrorStateProps) {
    return (
        <div role="alert">
            {message}
        </div>
    );
}