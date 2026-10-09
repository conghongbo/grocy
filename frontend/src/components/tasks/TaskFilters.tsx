import type {
    TaskAssignableUser,
    TaskCategory,
} from "../../api/tasks";

import type {
    TaskFiltersState,
    TaskStatusFilter,
} from "../../domain/tasks/taskFilters";

interface TaskFiltersProps {
    filters: TaskFiltersState;
    categories: TaskCategory[];
    users: TaskAssignableUser[];

    onChange: (
        filters: TaskFiltersState,
    ) => void;

    onClear: () => void;
}

export function TaskFilters({
    filters,
    categories,
    users,
    onChange,
    onClear,
}: TaskFiltersProps) {
    return (
        <div className="react-task-card">
            <div className="react-task-card-header">
                <span>⚑ Filters</span>

                <button
                    type="button"
                    className="
                        react-task-btn
                        react-task-btn-sm
                    "
                    onClick={onClear}
                >
                    Clear filters
                </button>
            </div>

            <div className="react-task-card-body">
                <div className="react-task-filters-grid">
                    <div className="react-task-field">
                        <label htmlFor="task-search">
                            Search
                        </label>

                        <input
                            id="task-search"
                            className="react-task-control"
                            type="search"
                            placeholder="Search"
                            value={filters.search}
                            onChange={(event) => {
                                onChange({
                                    ...filters,
                                    search:
                                        event.target.value,
                                });
                            }}
                        />
                    </div>

                    <div className="react-task-field">
                        <label htmlFor="task-status">
                            Status
                        </label>

                        <select
                            id="task-status"
                            className="react-task-control"
                            value={filters.status}
                            onChange={(event) => {
                                onChange({
                                    ...filters,
                                    status:
                                        event.target
                                            .value as TaskStatusFilter,
                                });
                            }}
                        >
                            <option value="all">
                                All
                            </option>

                            <option value="open">
                                Open
                            </option>

                            <option value="overdue">
                                Overdue
                            </option>

                            <option value="today">
                                Due today
                            </option>

                            <option value="due-soon">
                                Due soon
                            </option>

                            <option value="completed">
                                Completed
                            </option>
                        </select>
                    </div>

                    <div className="react-task-field">
                        <label htmlFor="task-category-filter">
                            Category
                        </label>

                        <select
                            id="task-category-filter"
                            className="react-task-control"
                            value={filters.categoryId}
                            onChange={(event) => {
                                onChange({
                                    ...filters,
                                    categoryId:
                                        event.target.value,
                                });
                            }}
                        >
                            <option value="">
                                All
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div className="react-task-field">
                        <label htmlFor="task-assignment-filter">
                            Assignment
                        </label>

                        <select
                            id="task-assignment-filter"
                            className="react-task-control"
                            value={
                                filters.assignedToUserId
                            }
                            onChange={(event) => {
                                onChange({
                                    ...filters,
                                    assignedToUserId:
                                        event.target.value,
                                });
                            }}
                        >
                            <option value="">
                                All
                            </option>

                            {users.map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.display_name ??
                                        user.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="react-task-checkbox">
                        <input
                            type="checkbox"
                            checked={filters.showDone}
                            onChange={(event) => {
                                onChange({
                                    ...filters,
                                    showDone:
                                        event.target.checked,
                                });
                            }}
                        />

                        Show done tasks
                    </label>
                </div>
            </div>
        </div>
    );
}