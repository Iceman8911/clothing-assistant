import type { ClothingItem } from "./types";
import { ReactiveMap } from "@solid-primitives/map";

/**
 * Each clothing item is indexed with it's `id`
 */
export const gClothingItems = new ReactiveMap<string, ClothingItem>();
