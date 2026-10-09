import "../styles/chores-overview.css";

import {
    ChoresOverviewPage,
} from "../features/chores-overview";

import {
    mountReactPage,
} from "../app/mount";

mountReactPage(
    "react-chores-overview-root",
    <ChoresOverviewPage />,
);