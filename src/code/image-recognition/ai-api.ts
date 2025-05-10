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
		{ text: "Return a short description of this image" },
	];

	return await ai.models.generateContent({ model, contents });
}
