import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { MonthlyStats } from "./pages/MonthlyStats";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LandingPage } from "./pages/LandingPage";
import { TrialExperience } from "./pages/TrialExperience";
import { ResetPage } from "./pages/ResetPage";
import { ReviewPage } from "./pages/ReviewPage";
import { IfThenPage } from "./pages/IfThenPage";
import { DeleteAccountPage } from "./pages/DeleteAccountPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    ),
  },
  {
    path: "/monthly",
    element: (
      <ProtectedRoute>
        <MonthlyStats />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sign-in/*",
    element: <SignInPage />,
  },
  {
    path: "/sign-up/*",
    element: <SignUpPage />,
  },
  {
    path: "/lp",
    element: <LandingPage />,
  },
  {
    path: "/trial",
    element: <TrialExperience />,
  },
  {
    path: "/reset",
    element: <ResetPage />,
  },
  {
    path: "/review",
    element: <ReviewPage />,
  },
  {
    path: "/ifthen",
    element: <IfThenPage />,
  },
  {
    path: "/delete",
    element: (
      <ProtectedRoute>
        <DeleteAccountPage />
      </ProtectedRoute>
    ),
  },
]);
