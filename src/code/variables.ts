import { ReactiveMap } from "@solid-primitives/map";
import { ClothingItem } from "./classes/clothing";
import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { isServer } from "solid-js/web";
import gFirebaseFunctions from "./database/firebase";
import { gShowSavingAlert } from "./functions";
import { gEnumReactiveMember } from "./enums";

type Settings = {
  currency: "$" | "€" | "£" | "¥" | "₦";
  syncId: string;
  apiKeys: {
    /**
     * Whether API keys should be persisted in the browser's local storage
     */
    persist: boolean;

    // AI Models
    gemini: string;
  };
};

export const gDefaultSettings = {
  currency: "₦",
  syncId: "",
  apiKeys: {
    persist: false,
    gemini: "",
  },
} as const satisfies Settings;

/** Contains the stores (in-memory and persistent) for clothing items */
export const gClothingItemStore = {
  /**
   * In-memory store for clothing. Each clothing item is indexed with it's `id`.

   Avoid using `set()` and `delete()` if you care about persistence and other stuff.
   */
  items: new ReactiveMap<string, ClothingItem>(),
  /** Last time a clothing item was added / removed */
  lastEdited: new Date(),

  /**
   * Preferred to `gClothingItemStore.items.set`. Only call this in a reactive context
   */
  addItem(clothing: ClothingItem) {
    gShowSavingAlert();

    /** Set the timestamps */
    this.storeLastEdited[gEnumReactiveMember.SETTER](
      (this.lastEdited = clothing.dateEdited = new Date()),
    );

    const unwrapped = unwrap(clothing);
    this.items.set(clothing.id, clothing);

    this.store.setItem(clothing.id, unwrapped).then((_) => {
      clothing.safeForServer.then((data) => {
        gFirebaseFunctions.addClothing(data);
      });
    });
  },

  /**
   * Preferred to `gClothingItemStore.items.delete`. Only call this in a reactive context
   */
  removeItem(clothingId: string) {
    gShowSavingAlert();

    /** Set the timestamps */
    this.storeLastEdited[gEnumReactiveMember.SETTER](
      (this.lastEdited = new Date()),
    );

    this.items.delete(clothingId);
    this.store.removeItem(clothingId).then((_) => {
      gFirebaseFunctions.removeClothing(clothingId);
    });
  },

  /** Localforage instance for persisting `items` */
  store: !isServer
    ? localforage.createInstance({
        name: "clothingItems",
      })
    : ({} as LocalForage), // Provide a fallback on the server
  /** `this.lastEdited` but a persistent signal. */
  storeLastEdited: makePersisted(createSignal(new Date()), {
    name: "storeLastEdited",
    storage: !isServer ? localforage : undefined,
    deserialize(data) {
      return new Date();
    },
  }),

  /** Filled clothing ids when changes occur to clothing but the user lacks a stable connection.

      Emptied when connection is back. */
  pendingUpload: makePersisted(createStore<string[]>([]), {
    name: "pending-sync",
    storage: !isServer ? localforage : undefined,
  }),
};

/**
 * Global search text used for filtering
 */
export const [gSearchText, gSetSearchText] = createSignal("");

/** Global Settings */
// Only initialize makePersisted on the client
export const [gSettings, gSetSettings] = makePersisted(
  createStore<Settings>(structuredClone(gDefaultSettings)),
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
    storage: !isServer ? localforage : undefined,
  },
);
