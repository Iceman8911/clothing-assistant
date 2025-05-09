import StockIcon from "lucide-solid/icons/blocks";
import HomeIcon from "lucide-solid/icons/home";
import ReportsIcon from "lucide-solid/icons/candlestick-chart";
import SettingsIcon from "lucide-solid/icons/settings";
import SunIcon from "lucide-solid/icons/sun";
import MoonIcon from "lucide-solid/icons/moon";
import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import CirclePlusIcon from "lucide-solid/icons/circle-plus";
import CreateClothingModal from "./create_clothing";

export const enum DockButton {
	HOME = "/",
	STOCK = "/inventory",
	REPORTS = "/reports",
	// SETTINGS = "/settings",
}

export default function Dock(props: any) {
	const [activeBtn, setActiveBtn] = createSignal(DockButton.HOME);
	const navigate = useNavigate();

	const handleBtnClick = (btn: DockButton) => {
		setActiveBtn(btn);
		navigate(btn);
	};

	onMount(() => {
		navigate(DockButton.HOME);
	});

	const [prefersDarkTheme, setPrefersDarkTheme] = createSignal(false);

	onMount(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		setPrefersDarkTheme(mediaQuery.matches);
		mediaQuery.addEventListener("change", (event) => {
			setPrefersDarkTheme(event.matches);
		});
	});

	let createClothingModalDialog!: HTMLDialogElement;

	return (
		<>
			<div class="dock dock-lg">
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

				<button onClick={() => createClothingModalDialog.showModal()}>
					<CirclePlusIcon />
					<span class="dock-label">Add Cloth</span>
				</button>

				<button
					class={activeBtn() == DockButton.REPORTS ? "dock-active" : ""}
					onClick={() => handleBtnClick(DockButton.REPORTS)}
				>
					<ReportsIcon />
					<span class="dock-label">Reports</span>
				</button>

				{/* <button
				class={activeBtn() == DockButton.SETTINGS ? "dock-active" : ""}
				onClick={() => handleBtnClick(DockButton.SETTINGS)}
			>
				<SettingsIcon />
				<span class="dock-label">Settings</span>
			</button> */}

				<button
					onClick={(e) => {
						(e.target as HTMLButtonElement).querySelector("input")?.click();
					}}
				>
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
					<span
						class="dock-label whitespace-nowrap"
						onClick={(e) => {
							e.stopPropagation();
							e.target.parentElement?.click();
						}}
					>
						Toggle Theme
					</span>
				</button>
			</div>

			{/* Dialog for the create clothing modal */}
			<dialog
				class="modal modal-bottom sm:modal-middle"
				ref={createClothingModalDialog}
			>
				<div class="modal-box">
					<form method="dialog">
						<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
							✕
						</button>
					</form>
					<CreateClothingModal dialogParent={createClothingModalDialog} />
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
