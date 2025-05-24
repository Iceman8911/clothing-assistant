import { gTriggerAlert } from "~/components/shared/alert-toast";
import {
  SerializableClothingDatabaseItem,
  type ClothingItem,
} from "../classes/clothing";
import { gIsUserConnectedToInternet } from "../functions";
import { gClothingItemStore, gSettings } from "../variables";
import { gStatusEnum } from "../enums";
import { produce, unwrap } from "solid-js/store";

const LAST_UPDATED_COLLECTION = "last_updated";
const PROJECT_ID = "clothing-assistant-b7ae8";
const BASE_URL =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/` as const;
const AUTH_TOKEN: Promise<AnonSignUpResponse> = (() => {
  "use server";
  const API_KEY = process.env.FIREBASE_API_KEY;

  return fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        returnSecureToken: true,
      }),
    },
  ).then((res) => res.json());
})();
const SHARED_HEADERS = async () => {
  return {
    Authorization: `Bearer ${(await AUTH_TOKEN).idToken}`,
    "Content-Type": "application/json",
  } as const;
};

interface AnonSignUpResponse {
  kind: string;
  /** What we're looking for */
  idToken: string;
  refreshToken: string;
  /** A number (in seconds) string, "3600" */
  expiresIn: string;
  localId: string;
}

/**
 * Represents a Firestore document data structure for REST API operations.
 * Mirrors the Firestore API's Document object.
 */
interface FirestoreDocument {
  fields: {
    [fieldName: string]: FirestoreFieldValue;
  };
}

/**
 * Union type covering all possible Firestore field value types
 */
type FirestoreFieldValue =
  | StringValue
  | IntegerValue
  | DoubleValue
  | BooleanValue
  | TimestampValue
  | MapValue
  | ArrayValue
  | NullValue
  | BytesValue
  | GeoPointValue
  | ReferenceValue;

// Individual type definitions for each Firestore data type
type StringValue<TType = string> = { stringValue: TType };
/** Recommended to use string for precise large numbers */
type IntegerValue<TType = string> = { integerValue: TType };
type DoubleValue<TType = number> = { doubleValue: TType };
type BooleanValue<TType = boolean> = { booleanValue: TType };
/** ISO 8601 format */
type TimestampValue<TType = string> = { timestampValue: TType };
type MapValue = { mapValue: FirestoreDocument };
type ArrayValue = { arrayValue: { values: FirestoreFieldValue[] } };
type NullValue = { nullValue: null };
/** Base64-encoded string */
type BytesValue<TType = string> = { bytesValue: TType };
type GeoPointValue<TLatitude = number, TLongitude = number> = {
  geoPointValue: { latitude: TLatitude; longitude: TLongitude };
};
/** Full document path */
type ReferenceValue<TType = string> = { referenceValue: TType };

interface SeasonValue extends MapValue {
  mapValue: {
    fields: Record<keyof ClothingItem["season"], BooleanValue>;
  };
}

interface OccasionValue extends MapValue {
  mapValue: {
    fields: Record<keyof ClothingItem["occasion"], BooleanValue>;
  };
}

/** Each of this will be a collection under a document created from their `id` */
interface ClothingDatabaseEntry extends FirestoreDocument {
  fields: {
    name: StringValue;
    description: StringValue;
    brand: StringValue;
    gender: StringValue<ClothingItem["gender"]>;
    color: StringValue;
    material: StringValue;
    category: StringValue<ClothingItem["category"]>;
    subCategory: StringValue;
    season: SeasonValue;
    occasion: OccasionValue;
    condition: StringValue<ClothingItem["condition"]>;
    costPrice: IntegerValue;
    sellingPrice: IntegerValue;
    quantity: IntegerValue;
    size: StringValue<ClothingItem["size"]>;
    dateBought: TimestampValue;
    dateEdited: TimestampValue;
    // TODO: Maybe don't make this optional?
    imgUrl?: StringValue;
  };
}

/** It goes like `collection`/`document`/`collection`/`document`, etc */
const createDocumentPath = (...collectionOrDocument: string[]) =>
  collectionOrDocument.reduce((acc, curr) => {
    return acc
      ? `${acc}/${encodeURIComponent(curr)}`
      : encodeURIComponent(curr);
  }, "");

/** Path to the collection where the user's clothing would be stored */
const userClothingPath = (clothingId: string) =>
  createDocumentPath(gSettings.syncId, clothingId);

/** The actual endpoint we'll be pinging */
const endpoint = (path: string) =>
  `${BASE_URL}${userClothingPath(path)}` as const;

async function getDoc(path: string) {
  return (
    await fetch(endpoint(path), {
      headers: await SHARED_HEADERS(),
    })
  ).json();
}

function getClothing(id: string): Promise<ClothingDatabaseEntry> {
  return getDoc(id);
}

async function addClothingItemDoc(
  clothingId: string,
  fieldsToAdd: ClothingDatabaseEntry,
  shouldUpdate = false,
) {
  if (!gIsUserConnectedToInternet()) {
    gTriggerAlert(gStatusEnum.INFO, "Sync scheduled for when next connected.");

    if (!gClothingItemStore.pendingSync[0].find((val) => val == clothingId))
      gClothingItemStore.pendingSync[1]([
        ...gClothingItemStore.pendingSync[0],
        clothingId,
      ]);
  }

  const resJson = (
    await fetch(endpoint(clothingId), {
      headers: await SHARED_HEADERS(),
      method: !shouldUpdate ? "PATCH" : "POST",
      body: JSON.stringify(fieldsToAdd),
    })
  ).json();

  // Update the last time the db was modified.
  // I know that Firestore auto-saves when it was modified but due to latency and stuff, it's not reliable for my use case (it's normally around a second or 2 off)
  await fetch(endpoint(LAST_UPDATED_COLLECTION), {
    headers: await SHARED_HEADERS(),
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        [LAST_UPDATED_COLLECTION]: fieldsToAdd.fields.dateEdited,
      },
    } as FirestoreDocument),
  });

  return resJson;
}

/** Returns `true` if the document has been deleted. */
async function deleteDoc(path: string) {
  return (
    await fetch(endpoint(path), {
      headers: await SHARED_HEADERS(),
      method: "DELETE",
    })
  ).ok;
}

async function addClothing(clothingItem: SerializableClothingDatabaseItem) {
  try {
    const resJson: ClothingDatabaseEntry = await addClothingItemDoc(
      clothingItem.id,
      {
        fields: {
          brand: { stringValue: clothingItem.brand },
          category: { stringValue: clothingItem.category },
          color: { stringValue: clothingItem.color },
          condition: { stringValue: clothingItem.condition },
          costPrice: { integerValue: `${clothingItem.costPrice}` },
          dateBought: { timestampValue: clothingItem.dateBought.toISOString() },
          dateEdited: {
            timestampValue: clothingItem.dateEdited.toISOString(),
          },
          description: { stringValue: clothingItem.description },
          gender: { stringValue: clothingItem.gender },
          material: { stringValue: clothingItem.material },
          name: { stringValue: clothingItem.name },
          occasion: {
            mapValue: {
              fields: {
                activeWear: { booleanValue: clothingItem.occasion.activeWear },
                casual: { booleanValue: clothingItem.occasion.casual },
                formal: { booleanValue: clothingItem.occasion.formal },
              },
            },
          },
          quantity: { integerValue: `${clothingItem.quantity}` },
          season: {
            mapValue: {
              fields: {
                fall: { booleanValue: clothingItem.season.fall },
                spring: { booleanValue: clothingItem.season.spring },
                summer: { booleanValue: clothingItem.season.summer },
                winter: { booleanValue: clothingItem.season.winter },
              },
            },
          },
          sellingPrice: { integerValue: `${clothingItem.sellingPrice}` },
          size: { stringValue: clothingItem.size },
          subCategory: { stringValue: clothingItem.subCategory }, //,imgUrl:{stringValue:clothingItem.imgFile.}
        },
      },
    );

    console.log("Document written. Response JSON is: ", resJson);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function removeClothing(id: string) {
  return deleteDoc(id);
}

/** Global methods solely for interacting with Firebase FireStore */
const gFirebaseFunctions = {
  getClothing,
  addClothing,
  removeClothing,
} as const;

export default gFirebaseFunctions;
