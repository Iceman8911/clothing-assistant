import { gTriggerAlert } from "~/components/shared/alert-toast";
import { gEnumStatus } from "./enums";

export const generateRandomId = () => crypto.randomUUID();

export async function gIsUserConnectedToInternet(): Promise<boolean> {
	try {
		const response = await fetch("https://www.gstatic.com/generate_204", {
			method: "POST",
			mode: "no-cors",
		});

		if (response) return true;
		else return false;
	} catch (_) {
		return false;
	}
}

export const gShowSavingAlert = () =>
	gTriggerAlert(gEnumStatus.INFO, "Saving Changes… ");
