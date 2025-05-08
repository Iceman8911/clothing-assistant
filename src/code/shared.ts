import { createStore } from "solid-js/store";
import type { ClothingItem } from "./types";

const [clothingItems, setClothingItems] = createStore<ClothingItem[]>([]);

export {
	clothingItems as clothingItemStore,
	setClothingItems as setClothingItemsStore,
};
