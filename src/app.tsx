import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Dock, { DockButton } from "./components/dock";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";

import "./code/image-recognition/ai-api";

export default function App() {
	return (
		<>
			<Router
				root={(props) => (
					<>
						<NavBar />
						<Suspense>{props.children}</Suspense>
						<Dock></Dock>
					</>
				)}
			>
				<Route path={DockButton.HOME} component={HomePage} />
				<Route path={DockButton.STOCK} component={InventoryPage} />
				<Route path={DockButton.REPORTS} component={ReportPage} />
				{/* <Route path={DockButton.SETTINGS} component={SettingsPage} /> */}
			</Router>
		</>
	);
}
