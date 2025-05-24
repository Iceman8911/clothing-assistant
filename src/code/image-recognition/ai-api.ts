"use server";
import { gTriggerAlert } from "~/components/shared/alert-toast";
import { type ClothingItem } from "../classes/clothing";
import { gEnumStatus } from "../enums";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
] as const;

async function tryGenerateContent(
  apiKey: string,
  contents: any,
  modelIndex = 0,
): Promise<AiJsonResponse> {
  if (modelIndex >= GEMINI_MODELS.length) {
    throw new Error("No more models available. Please try again later");
  }

  const model = GEMINI_MODELS[modelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              contents[0], // Image data
              { text: contents[1].text }, // Prompt
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("No valid response from Gemini");
    }

    // Clean up the text before parsing
    return JSON.parse(
      textResponse.replace("```", "").replace("json", "").replace("```", ""),
    ) as AiJsonResponse;
  } catch (error) {
    gTriggerAlert(
      gEnumStatus.ERROR,
      `Failed with ${model} because: ${error}. Trying others...`,
    );
    return tryGenerateContent(apiKey, contents, modelIndex + 1);
  }
}

export function understandImageWithGemini(
  apiKey: string,
  /** Base64 encoded image */
  imageData: string,
): Promise<AiJsonResponse> {
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

  return tryGenerateContent(apiKey, contents);
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
export interface AiJsonResponse {
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
