import { ReactiveMap } from "@solid-primitives/map";
import { ClothingItem } from "./classes/clothing";
import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";

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
 * Each clothing item is indexed with it's `id`.

 Avoid using `set()` and `delete()` if you care about persistence and other stuff.
 */
export const gClothingItems = new ReactiveMap<string, ClothingItem>();

/**
 * Global search text used for filtering
 */
export const [gSearchText, gSetSearchText] = createSignal("");

/** Global Settings */
export const [gSettings, gSetSettings] = makePersisted(
  createStore(structuredClone(gDefaultSettings)),
  {
    name: "settings",
    serialize: function (data) {
      const dataCopy = structuredClone(unwrap(data));

      // don't store the api keys
      if (!dataCopy.apiKeys.persist) {
        dataCopy.apiKeys.gemini = "";
      }

      return JSON.stringify(dataCopy);
    },
  },
);

export const gClothingItemPersistentStore = localforage.createInstance({
  name: "clothingItems",
});
