import { createSignal } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { createStore } from "solid-js/store";
import { useNavigate } from "@solidjs/router";
import { ClothingItem } from "./classes/clothing";

export const generateRandomId = () => crypto.randomUUID();

/**
 * Each clothing item is indexed with it's `id`
 */
export const gClothingItems = new ReactiveMap<string, ClothingItem>();

/**
 * Global search text used for filtering
 */
export const [gSearchText, gSetSearchText] = createSignal("");

export const gDefaultSettings = {
	apiKeys: {
		// Settings
		/**
		 * Whether API keys should be persisted in the browser's local storage
		 */
		persist: false,

		// AI Models
		gemini: "",
	},
};

export const gSettingsLocalStorageKey = "settings";
export const [gSettings, gSetSettings] = createStore(
	structuredClone(gDefaultSettings)
);
