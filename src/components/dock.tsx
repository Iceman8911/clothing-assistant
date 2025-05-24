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
import { gEnumCustomRoute } from "~/code/enums";

export default function Dock(props: any) {
  const [activeBtn, setActiveBtn] = createSignal(gEnumCustomRoute.HOME);
  const navigate = useNavigate();

  const handleBtnClick = (btn: gEnumCustomRoute) => {
    setActiveBtn(btn);
    navigate(btn);
  };

  onMount(() => {
    navigate(gEnumCustomRoute.HOME);
  });

  const [prefersDarkTheme, setPrefersDarkTheme] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDarkTheme(mediaQuery.matches);
    mediaQuery.addEventListener("change", (event) => {
      setPrefersDarkTheme(event.matches);
    });
  });

  return (
    <>
      <div class="dock dock-lg">
        <button
          class={activeBtn() == gEnumCustomRoute.HOME ? "dock-active" : ""}
          onClick={() => handleBtnClick(gEnumCustomRoute.HOME)}
        >
          <HomeIcon />
          <span class="dock-label">Home</span>
        </button>

        <button
          class={activeBtn() == gEnumCustomRoute.STOCK ? "dock-active" : ""}
          onClick={() => handleBtnClick(gEnumCustomRoute.STOCK)}
        >
          <StockIcon />
          <span class="dock-label">Stock</span>
        </button>

        <button onClick={() => setIsModalOpen(true)}>
          <CirclePlusIcon />
          <span class="dock-label">Add Cloth</span>
        </button>

        <button
          class={activeBtn() == gEnumCustomRoute.REPORTS ? "dock-active" : ""}
          onClick={() => handleBtnClick(gEnumCustomRoute.REPORTS)}
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
            e.currentTarget.querySelector("input")?.click();
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
      <CreateClothingModal
        stateAccessor={isModalOpen}
        stateSetter={setIsModalOpen}
      />
    </>
  );
}
