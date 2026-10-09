import "../styles/batteries-overview.css";

import {
    BatteriesOverviewPage,
} from "../features/batteries-overview";

import {
    mountReactPage,
} from "../app/mount";

mountReactPage(
    "react-batteries-overview-root",
    <BatteriesOverviewPage />,
);