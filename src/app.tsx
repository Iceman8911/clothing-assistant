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
import {
	gDefaultSettings,
	gSetSettings,
	gSettings,
	gSettingsLocalStorageKey,
} from "./code/shared";

export default function App() {
	function loadSettings(): typeof gSettings {
		try {
			const data = localStorage.getItem(gSettingsLocalStorageKey);

			if (!data) throw new Error();

			return JSON.parse(data);
		} catch (_) {
			console.error(
				"Error parsing local storage data, falling back to defaults"
			);

			// Fallback to defaults
			return structuredClone(gDefaultSettings);
		}
	}

	onMount(() => {
		gSetSettings(loadSettings());
	});

	return (
		<>
			<Router
				root={(props) => (
					<>
						<NavBar />
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
