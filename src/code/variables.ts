import { ReactiveMap } from "@solid-primitives/map";
import { ClothingItem } from "./classes/clothing";
import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { isServer } from "solid-js/web";
import gFirebaseFunctions from "./server/database/firebase";
import { gShowSavingAlert } from "./functions";
import { gEnumReactiveMember } from "./enums";
import { UUID } from "./types";
import gCloudinaryFunctions from "./server/file-hosting/cloudinary";

type Settings = {
  currency: "$" | "€" | "£" | "¥" | "₦";
  syncId: UUID;
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
  syncId: "" as any,
  apiKeys: {
    persist: false,
    gemini: "",
  },
} as const satisfies Settings;

function removeServerClothing(syncId: UUID, clothingId: UUID) {
  "use server";
  gFirebaseFunctions.removeClothing(syncId, clothingId);
  gCloudinaryFunctions.deleteImage(clothingId);
}

/** Contains the stores (in-memory and persistent) for clothing items */
export const gClothingItemStore = {
  /**
   * In-memory store for clothing. Each clothing item is indexed with it's `id`.

   Avoid using `set()` and `delete()` if you care about persistence and other stuff.
   */
  items: new ReactiveMap<UUID, ClothingItem>(),
  /** Last time a clothing item was added / removed */
  lastEdited: new Date(),

  /**
   * Preferred to `gClothingItemStore.items.set`. Only call this in a reactive context
   */
  addItem(
    clothing: ClothingItem,
    /** The only time this will be false would be when we sync data from the server to the client */
    uploadToServer = true,
  ) {
    gShowSavingAlert();

    /** Set the timestamps */
    this.storeLastEdited[gEnumReactiveMember.SETTER](
      (this.lastEdited = clothing.dateEdited =
        uploadToServer ? new Date() : clothing.dateEdited),
    );

    const unwrapped = unwrap(clothing);
    this.items.set(clothing.id, clothing);

    this.store.setItem(clothing.id, unwrapped).then((_) => {
      if (!uploadToServer) return;

      clothing.safeForServer().then((data) => {
        gFirebaseFunctions.addClothing(
          gSettings.syncId,
          data,
          gClothingItemStore,
        );
      });
    });
  },

  /**
   * Preferred to `gClothingItemStore.items.delete`. Only call this in a reactive context
   */
  removeItem(clothingId: UUID, deleteFromServer = true) {
    gShowSavingAlert();

    /** Set the timestamps */
    this.storeLastEdited[gEnumReactiveMember.SETTER](
      (this.lastEdited = new Date()),
    );

    this.items.delete(clothingId);
    this.store.removeItem(clothingId).then((_) => {
      if (!deleteFromServer) return;

      removeServerClothing(gSettings.syncId, clothingId);
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
  pendingUpload: makePersisted(createStore<UUID[]>([]), {
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
