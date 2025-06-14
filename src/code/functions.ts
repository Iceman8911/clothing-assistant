import { unwrap } from "solid-js/store";
import { type ClothingItem } from "./classes/clothing";
import { createEffect, on } from "solid-js";
import { trackStore } from "@solid-primitives/deep";
import { gTriggerAlert } from "~/components/shared/alert-toast";
import { gEnumStatus } from "./enums";
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

export const gShowSavingAlert = () =>
  gTriggerAlert(gEnumStatus.INFO, "Saving Changes… ");
