import type {
    TaskAssignableUser,
    TaskCategory,
} from "../../api/tasks";

import type {
    TaskFiltersState,
    TaskStatusFilter,
} from "../../features/tasks/taskFilters";

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
        <div>
            <h3>Filters</h3>

            <div>
                <label htmlFor="task-search">
                    Search
                </label>

                <input
                    id="task-search"
                    type="search"
                    value={filters.search}
                    placeholder="Search"
                    onChange={(event) => {
                        onChange({
                            ...filters,
                            search:
                                event.target.value,
                        });
                    }}
                />
            </div>

            <div>
                <label htmlFor="task-status">
                    Status
                </label>

                <select
                    id="task-status"
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

            <div>
                <label htmlFor="task-category-filter">
                    Category
                </label>

                <select
                    id="task-category-filter"
                    value={
                        filters.categoryId
                    }
                    onChange={(event) => {
                        onChange({
                            ...filters,

                            categoryId:
                                event.target
                                    .value,
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
                                value={
                                    category.id
                                }
                            >
                                {category.name}
                            </option>
                        ),
                    )}
                </select>
            </div>

            <div>
                <label htmlFor="task-assignment-filter">
                    Assignment
                </label>

                <select
                    id="task-assignment-filter"
                    value={
                        filters.assignedToUserId
                    }
                    onChange={(event) => {
                        onChange({
                            ...filters,

                            assignedToUserId:
                                event.target
                                    .value,
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

            <label>
                <input
                    type="checkbox"
                    checked={filters.showDone}
                    onChange={(event) => {
                        onChange({
                            ...filters,

                            showDone:
                                event.target
                                    .checked,
                        });
                    }}
                />

                {" "}
                Show done tasks
            </label>

            <div>
                <button
                    type="button"
                    onClick={onClear}
                >
                    Clear filters
                </button>
            </div>
        </div>
    );
}