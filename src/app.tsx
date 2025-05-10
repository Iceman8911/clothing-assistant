import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";

import "./code/image-recognition/ai-api";
import { CustomRoute } from "./code/enums";
import Dock from "./components/dock";

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
				<Route path={CustomRoute.HOME} component={HomePage} />
				<Route path={CustomRoute.STOCK} component={InventoryPage} />
				<Route path={CustomRoute.REPORTS} component={ReportPage} />
				<Route path={CustomRoute.SETTINGS} component={SettingsPage} />
			</Router>
		</>
	);
}
