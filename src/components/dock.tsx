import StockIcon from "lucide-solid/icons/blocks";
import HomeIcon from "lucide-solid/icons/home";
import ReportsIcon from "lucide-solid/icons/candlestick-chart";
import SettingsIcon from "lucide-solid/icons/settings";
import { createSignal } from "solid-js";

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
		</div>
	);
}
