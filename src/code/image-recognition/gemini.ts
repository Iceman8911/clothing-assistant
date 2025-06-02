"use server";
import { type ClothingItem } from "../classes/clothing";
import { type ContentListUnion, GoogleGenAI } from "@google/genai";

const geminiModels = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
] as const;

function initGoogleGenAI(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

let ai: GoogleGenAI | null = null;

async function tryGenerateContent(
  apiKey: string,
  contents: ContentListUnion,
  modelIndex = 0,
) {
  if (!ai) ai = initGoogleGenAI(apiKey);

  if (modelIndex + 1 > geminiModels.length) {
    throw new Error("No more models available. Please try again later");
  }

  try {
    return (
      await ai.models.generateContent({
        model: geminiModels[modelIndex],
        contents,
      })
    ).text!;
  } catch (_) {
    return await tryGenerateContent(apiKey, contents, modelIndex + 1);
  }
}

async function parseImage(
  apiKey: string,
  /** Base64 encoded image */
  imageData: string,
): Promise<GeminiAiJsonResponse> {
  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData,
      },
    },
    {
      text: `Your answer must be in an easily parseable JSON format. I will list certain fields and based off the uploaded clothing image, you will derive an appropriate answer for the field listed. Focus on the main clothing item. Use an array format for "Color", "Season", and "Occasion". Use whatever feels appropriate for "Material", "Color", and "Brand". Ensure you stick to the format and obey the instructions exactly. Let's start:

      Name (short string):
      Description (long string):
      Category ("Tops", "Bottoms", "Outer Wear", "Inner Wear"):
      Subcategory ("Jacket", "Coat", "Hat", "Underwear", "Socks", Whatever feels appropriate):
      Material (Only state your best guess e.g "Cotton"):
      Color ():
      Brand (If unknown, reply "NA"):
      Season ("Spring", "Summer", "Fall", "Winter". Multiple can be selected.):
      Occasion ("Formal", "Casual", "Active Wear". Multiple can be selected.):
      Condition ("New", "Used", "Refurbished"):
      Gender ("Male", "Female", "Unisex"):
			Size ("XS", "S", "M", "L", "XL"):
      `,
    },
  ];

  return JSON.parse(
    (await tryGenerateContent(apiKey, contents))
      .replace("```", "")
      .replace("json", "")
      .replace("```", ""),
  );
}

/**
 * Example:
 * ```json
      {
      "Name": "Plaid Shirt",
      "Description": "A short-sleeved plaid shirt with a button-down front, chest pockets with flaps, and a pointed collar.",
      "Category": "Tops",
      "Subcategory": "Shirt",
      "Material": "Cotton",
      "Color": "[Blue, Orange, Black]",
      "Brand": "NA",
      "Season": "[Spring, Summer, Fall]",
      "Occasion": "Casual",
      "Condition": "New",
      "Gender": "Male",
			"Size": "M"
      }
  ```
  */
export interface GeminiAiJsonResponse {
  Name: string;
  Description: string;
  Category: ClothingItem["category"];
  Subcategory: ClothingItem["subCategory"];
  Material: string;
  Color: string[];
  Brand: string;
  Season: Capitalize<keyof ClothingItem["season"]>[];
  Occasion: ("Formal" | "Casual" | "Active Wear")[];
  Condition: ClothingItem["condition"];
  Gender: ClothingItem["gender"];
  Size: ClothingItem["size"];
}

const gGeminiFunctions = {
  parseImage,
} as const;

export default gGeminiFunctions;
