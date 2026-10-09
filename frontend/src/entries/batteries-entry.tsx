import { mountReactPage } from "../app/mount";
import {
    BatteriesPage,
} from "../features/batteries";

import "../styles/batteries.css";

mountReactPage(
    "react-batteries-root",
    <BatteriesPage />,
);