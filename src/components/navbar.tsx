import { useNavigate } from "@solidjs/router";
import SyncIcon from "lucide-solid/icons/folder-sync";
import ListFilterIcon from "lucide-solid/icons/list-filter";
import SearchIcon from "lucide-solid/icons/search";
import SettingsIcon from "lucide-solid/icons/settings";
import ShirtIcon from "lucide-solid/icons/shirt";
import { Show } from "solid-js";
import { gEnumCustomRoute } from "~/code/enums";
import { gSearchText, gSetSearchText } from "~/code/variables";
export default function NavBar() {
  const navigate = useNavigate();

  let searchBar!: HTMLInputElement;

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
        <div
          class="dropdown"
          onClick={() => {
            searchBar.focus();
          }}
        >
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            {/* Display an indicator so the user knows that a search term / text is active */}
            <Show
              when={gSearchText()}
              fallback={<SearchIcon class="w-5 h-5" />}
            >
              <div class="indicator">
                <span class="indicator-item status status-warning "></span>
                <SearchIcon class="w-5 h-5" />
              </div>
            </Show>
          </div>

          <label class="input input-primary dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm -right-15 md:-right-10 -bottom-10">
            <SearchIcon class="w-4 h-4 mt-auto mb-auto" />
            <input
              type="search"
              required
              placeholder="Search"
              class="max-w-[90%]"
              oninput={(e) => gSetSearchText(e.currentTarget.value)}
              ref={searchBar}
            />
          </label>
        </div>

        <button class="btn btn-ghost btn-circle">
          <div class="indicator">
            <SyncIcon />
          </div>
        </button>

        <button
          class="btn btn-ghost btn-circle"
          onclick={(_) => navigate(gEnumCustomRoute.SETTINGS)}
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
