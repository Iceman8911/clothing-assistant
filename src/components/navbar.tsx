import SettingsIcon from "lucide-solid/icons/settings";
import ListFilterIcon from "lucide-solid/icons/list-filter";
import ShirtIcon from "lucide-solid/icons/shirt";
import SearchIcon from "lucide-solid/icons/search";
import { gSetSearchText } from "~/code/shared";
import { useNavigate } from "@solidjs/router";
import { CustomRoute } from "~/code/enums";
export default function NavBar() {
	const navigate = useNavigate();

	return (
		<div class="navbar bg-base-100 shadow-sm">
			<div class="navbar-start">
				<div class="dropdown">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
						<ListFilterIcon />
					</div>
					<ul
						tabindex="0"
						class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
					>
						<li>
							<a>Lorem</a>
						</li>
						<li>
							<a>Ispum</a>
						</li>
						<li>
							<a>Dolomet</a>
						</li>
					</ul>
				</div>
			</div>
			<div class="navbar-center">
				{/* <a class="btn btn-ghost text-xl">daisyUI</a> */}
				<ShirtIcon class="mr-1" />
				Cloventh
			</div>

			<div class="navbar-end">
				{/* Search Dropdown */}
				<div class="dropdown">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
						<SearchIcon class="w-5 h-5" />
					</div>

					<label class="input input-primary dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm -right-15 md:-right-10 -bottom-10">
						<SearchIcon class="w-4 h-4 mt-auto mb-auto" />
						<input
							type="search"
							required
							placeholder="Search"
							class="max-w-[90%]"
							oninput={(e) => gSetSearchText(e.currentTarget.value)}
						/>
					</label>
				</div>

				<button class="btn btn-ghost btn-circle">
					<div class="indicator">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							{" "}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>{" "}
						</svg>
						<span class="badge badge-xs badge-primary indicator-item"></span>
					</div>
				</button>

				<button
					class="btn btn-ghost btn-circle"
					onclick={(_) => navigate(CustomRoute.SETTINGS)}
				>
					<div class="indicator">
						<SettingsIcon />
						{/* <span class="badge badge-xs badge-primary indicator-item"></span> */}
					</div>
				</button>
			</div>
		</div>
	);
}
