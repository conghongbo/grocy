import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { TaskList } from "../../components/tasks/TaskList";

import { useTasks } from "./useTasks";

export function TasksPage() {
    const {
        tasks,
        loading,
        error,
        refresh,
        completeTask,
        undoTask,
        deleteTask,
    } = useTasks();

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <div>
                <ErrorState message={error} />

                <button
                    type="button"
                    onClick={() => {
                        void refresh();
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <EmptyState message="No tasks found." />
        );
    }

    return (
        <section>
            <div>
                <h1>Tasks</h1>

                <button
                    type="button"
                    onClick={() => {
                        void refresh();
                    }}
                >
                    Refresh
                </button>
            </div>

            <TaskList
                tasks={tasks}
                onComplete={completeTask}
                onUndo={undoTask}
                onDelete={deleteTask}
            />
        </section>
    );
}