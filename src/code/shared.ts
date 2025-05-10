import { createSignal } from "solid-js";
import type { ClothingItem } from "./types";
import { ReactiveMap } from "@solid-primitives/map";

/**
 * Each clothing item is indexed with it's `id`
 */
export const gClothingItems = new ReactiveMap<string, ClothingItem>();

/**
 * Global search text used for filtering
 */
export const [gSearchText, gSetSearchText] = createSignal("");
