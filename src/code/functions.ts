export const generateRandomId = () => crypto.randomUUID();
export async function gIsUserConnectedToInternet(): Promise<boolean> {
	try {
		const response = await fetch("http://www.gstatic.com/generate_204", {
			method: "POST",
			mode: "no-cors",
		});

		if (response) return true;
		else return false;
	} catch (error) {
		return false;
	}
}
