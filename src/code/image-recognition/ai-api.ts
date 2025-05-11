import { gApiKeys } from "../shared";
import { GoogleGenAI } from "@google/genai";

function initGoogleGenAI(apiKey: string) {
	return new GoogleGenAI({ apiKey });
}

export async function understandImageWithGemini(
	/** Base64 encoded image */
	imageData: string,
	apiKey: string,
	model = "gemini-2.0-flash"
) {
	const ai = initGoogleGenAI(apiKey);

	const contents = [
		{
			inlineData: {
				mimeType: "image/jpeg",
				data: imageData,
			},
		},
		{
			text: `Your answer must be in an easily parseable JSON format. I will list certain fields and based off the uploaded image, you will derive an appropriate answer for the field listed. Ensure you stick to the format and obey the instructions exactly. Let's start:
      
      Name (short string):
      Description (long string):
      Category ("Tops", "Bottoms", "Outer Wear", "Inner Wear"):
      Subcategory ("Jacket", "Coat", "Hat", "Underwear", "Socks", Whatever feels appropriate):
      Material (Whatever feels appropriate. Only state your best guess e.g "Cotton"):
      Color (Whatever feels appropriate, just pick the most prominent one):
      Brand (Whatever feels appropriate. If unknown, reply "NA"):
      Season ("Spring", "Summer", "Fall", "Winter". Multiple can be selected. Use an array format):
      Occasion ("Formal", "Casual", "Active Wear". Multiple can be selected. Use an array format):
      Condition ("New", "Used", "Refurbished"):
      Gender ("Male", "Female", "Unisex"):
      `,
		},
	];

	try {
		return await ai.models.generateContent({ model, contents });
	} catch (error) {
		try {
			return await ai.models.generateContent({
				model: "gemini-2.0-flash-lite",
				contents,
			});
		} catch (error) {
			return await ai.models.generateContent({
				model: "gemini-2.0-pro",
				contents,
			});
		}
	}
}
