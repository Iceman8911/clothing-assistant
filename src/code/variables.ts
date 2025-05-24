import { ReactiveMap } from "@solid-primitives/map";
import { ClothingItem } from "./classes/clothing";
import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { isServer } from "solid-js/web";

export const gDefaultSettings = {
  currency: "₦" as "$" | "€" | "£" | "¥" | "₦",
  syncId: "",
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
// Only initialize makePersisted on the client
export const [gSettings, gSetSettings] = !isServer
  ? makePersisted(createStore(structuredClone(gDefaultSettings)), {
      name: "settings",
      serialize: function (data) {
        const dataCopy = structuredClone(unwrap(data));

        // don't store the api keys
        if (!dataCopy.apiKeys.persist) {
          dataCopy.apiKeys.gemini = "";
        }

        return JSON.stringify(dataCopy);
      },
      storage: localforage,
    })
  : createStore(structuredClone(gDefaultSettings)); // Provide a fallback on the server

export const gClothingItemPersistentStore = !isServer
  ? localforage.createInstance({
      name: "clothingItems",
    })
  : ({} as LocalForage); // Provide a fallback on the server

/** Filled when changes occur to clothing but the user lacks a stable connection.

    Emptied when connection is back. */
export const [gPendingClothingToSync, gSetPendingClothingToSync] = !isServer
  ? makePersisted(createStore<string[]>([]))
  : createStore<string[]>([]); // Provide a fallback on the server
