import StockIcon from "lucide-solid/icons/blocks";
import HomeIcon from "lucide-solid/icons/home";
import ReportsIcon from "lucide-solid/icons/candlestick-chart";
import SettingsIcon from "lucide-solid/icons/settings";

export default function Dock(props: any) {
	return (
		<div class="dock">
			<button class="dock-active">
				<HomeIcon />
				<span class="dock-label">Home</span>
			</button>
			<button>
				<StockIcon />
				<span class="dock-label">Stock</span>
			</button>
			<button>
				<ReportsIcon />
				<span class="dock-label">Reports</span>
			</button>
			<button>
				<SettingsIcon />
				<span class="dock-label">Settings</span>
			</button>
		</div>
	);
}
