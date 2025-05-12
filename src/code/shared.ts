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

export const [gApiKeys, gSetApiKeys] = createStore({
	// cloudmersive: "",
	gemini: "",
});
