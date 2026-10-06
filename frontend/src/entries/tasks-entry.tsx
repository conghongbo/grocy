import "../styles/tasks.css";

import { TasksPage } from "../features/tasks";
import { mountReactPage } from "../app/mount";

mountReactPage(
    "react-tasks-root",
    <TasksPage />,
);