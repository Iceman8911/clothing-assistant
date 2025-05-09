import { createSignal } from "solid-js";
import type { ClothingItem } from "./types";

const [clothingItems, setClothingItems] = createSignal<ClothingItem[]>([]);

export {
	clothingItems as clothingItemSignal,
	setClothingItems as setClothingItemsSignal,
};
