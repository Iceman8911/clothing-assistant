import StockIcon from "lucide-solid/icons/blocks";
import HomeIcon from "lucide-solid/icons/home";
import ReportsIcon from "lucide-solid/icons/candlestick-chart";
import SettingsIcon from "lucide-solid/icons/settings";
import SunIcon from "lucide-solid/icons/sun";
import MoonIcon from "lucide-solid/icons/moon";
import { createSignal, onMount } from "solid-js";

const enum DockButton {
	HOME,
	STOCK,
	REPORTS,
	SETTINGS,
}

export default function Dock(props: any) {
	const [activeBtn, setActiveBtn] = createSignal(DockButton.HOME);
	const handleBtnClick = (btn: DockButton) => {
		setActiveBtn(btn);
	};

	const [prefersDarkTheme, setPrefersDarkTheme] = createSignal(false);

	onMount(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		setPrefersDarkTheme(mediaQuery.matches);
		mediaQuery.addEventListener("change", (event) => {
			setPrefersDarkTheme(event.matches);
		});
	});

	return (
		<div class="dock">
			<button
				class={activeBtn() == DockButton.HOME ? "dock-active" : ""}
				onClick={() => handleBtnClick(DockButton.HOME)}
			>
				<HomeIcon />
				<span class="dock-label">Home</span>
			</button>
			<button
				class={activeBtn() == DockButton.STOCK ? "dock-active" : ""}
				onClick={() => handleBtnClick(DockButton.STOCK)}
			>
				<StockIcon />
				<span class="dock-label">Stock</span>
			</button>
			<button
				class={activeBtn() == DockButton.REPORTS ? "dock-active" : ""}
				onClick={() => handleBtnClick(DockButton.REPORTS)}
			>
				<ReportsIcon />
				<span class="dock-label">Reports</span>
			</button>
			<button
				class={activeBtn() == DockButton.SETTINGS ? "dock-active" : ""}
				onClick={() => handleBtnClick(DockButton.SETTINGS)}
			>
				<SettingsIcon />
				<span class="dock-label">Settings</span>
			</button>
			<button>
				<label class="swap swap-rotate">
					{/* this hidden checkbox controls the state */}
					<input
						type="checkbox"
						class="theme-controller"
						value={prefersDarkTheme() ? "light" : "dark"}
					/>

					<SunIcon class="swap-off" />

					<MoonIcon class="swap-on" />
				</label>
				<span class="dock-label whitespace-nowrap">Toggle Theme</span>
			</button>
		</div>
	);
}
