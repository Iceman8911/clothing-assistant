import { ReactiveMap } from "@solid-primitives/map";
import { ClothingItem } from "./classes/clothing";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export const gDefaultSettings = {
  currency: "₦" as "$" | "€" | "£" | "¥" | "₦",
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

/**
 * Each clothing item is indexed with it's `id`
 */
export const gClothingItems = new ReactiveMap<string, ClothingItem>();

/**
 * Global search text used for filtering
 */
export const [gSearchText, gSetSearchText] = createSignal("");
export const gSettingsLocalStorageKey = "settings";
export const [gSettings, gSetSettings] = createStore(
  structuredClone(gDefaultSettings),
);
