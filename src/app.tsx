import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onMount, Suspense } from "solid-js";
import "./app.css";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";
import { CustomRoute } from "./code/enums";
import Dock from "./components/dock";
import { gDefaultSettings } from "./code/variables";
import { gSetSettings, gSettings } from "./code/variables";
import { AlertToast } from "./components/shared/alert-toast";

export default function App() {
  return (
    <>
      <Router
        root={(props) => (
          <>
            <NavBar />
            <AlertToast />
            <div class="h-[80vh] overflow-y-auto">
              <Suspense>{props.children}</Suspense>
            </div>
            <Dock></Dock>
          </>
        )}
      >
        <Route path={CustomRoute.HOME} component={HomePage} />
        <Route path={CustomRoute.STOCK} component={InventoryPage} />
        <Route path={CustomRoute.REPORTS} component={ReportPage} />
        <Route path={CustomRoute.SETTINGS} component={SettingsPage} />
      </Router>
    </>
  );
}
