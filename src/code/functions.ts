import { unwrap } from "solid-js/store";
import { ClothingItem } from "./classes/clothing";
import { gClothingItemPersistentStore, gClothingItems } from "./variables";
import { createEffect, on } from "solid-js";
import { trackStore } from "@solid-primitives/deep";
import { gTriggerAlert } from "~/components/shared/alert-toast";
import { gStatusEnum } from "./enums";
import gFirebaseFunctions from "./database/firebase";

export const generateRandomId = () => crypto.randomUUID();

export async function gIsUserConnectedToInternet(): Promise<boolean> {
  try {
    const response = await fetch("https://www.gstatic.com/generate_204", {
      method: "POST",
      mode: "no-cors",
    });

    if (response) return true;
    else return false;
  } catch (error) {
    return false;
  }
}

const showSavingAlert = () =>
  gTriggerAlert(gStatusEnum.INFO, "Saving Changes… ");
/**
 * Preferred to `gClothingItems.set`. Only call this in a reactive context
 */
export function gAddClothingItem(clothing: ClothingItem) {
  showSavingAlert();
  clothing.dateEdited = new Date();
  const unwrapped = unwrap(clothing);
  gClothingItemPersistentStore.setItem(clothing.id, unwrapped);
  gClothingItems.set(clothing.id, clothing);

  clothing.safeForServer.then((data) => {
    gFirebaseFunctions.addClothing(data);
  });
}

/**
 * Preferred to `gClothingItems.delete`. Only call this in a reactive context
 */
export function gRemoveClothingItem(clothingId: string) {
  showSavingAlert();
  gClothingItemPersistentStore.removeItem(clothingId);
  gClothingItems.delete(clothingId);
  gFirebaseFunctions.removeClothing(clothingId);
}
