import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { MonthlyStats } from "./pages/MonthlyStats";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/search",
    Component: Search,
  },
  {
    path: "/monthly",
    Component: MonthlyStats,
  },
]);
