import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import Dock, { DockButton } from "./components/dock";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";

export default function App() {
	return (
		<>
			<Router
				root={(props) => (
					<>
						<Suspense>{props.children}</Suspense>
						<Dock></Dock>
					</>
				)}
			>
				<Route path={DockButton.HOME} component={HomePage} />
				<Route path={DockButton.STOCK} component={InventoryPage} />
				<Route path={DockButton.REPORTS} component={ReportPage} />
				<Route path={DockButton.SETTINGS} component={SettingsPage} />
			</Router>
		</>
	);
}
