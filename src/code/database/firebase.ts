import { gTriggerAlert } from "~/components/shared/alert-toast";
import type {
  SerializableClothingDatabaseItem,
  ClothingItem,
} from "../classes/clothing";
import { gIsUserConnectedToInternet } from "../functions";
import { gClothingItemStore, gSettings } from "../variables";
import { gEnumStatus } from "../enums";
import { produce, unwrap } from "solid-js/store";
import { UUID } from "../types";

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

interface StructuredQuery<TFirestoreDocument extends FirestoreDocument> {
  from: CollectionSelector[];
  where?: Filter<TFirestoreDocument>;
  orderBy?: Order<TFirestoreDocument>[];
  limit?: number;
}

interface CollectionSelector {
  collectionId: string;
  /** Perfom the query on all descendants of the given collection */
  allDescendants?: boolean;
}

interface Filter<TFirestoreDocument extends FirestoreDocument> {
  fieldFilter?: FieldFilter<TFirestoreDocument>;
}

interface FieldFilter<TFirestoreDocument extends FirestoreDocument> {
  field: { fieldPath: keyof TFirestoreDocument["fields"] };
  op: "GREATER_THAN" | "LESS_THAN" | "EQUAL" | "ARRAY_CONTAINS";
  value: FirestoreFieldValue;
}

interface Order<TFirestoreDocument extends FirestoreDocument> {
  field: { fieldPath: keyof TFirestoreDocument["fields"] };
  direction: "ASCENDING" | "DESCENDING";
}

const SYNC_ID = () => gSettings.syncId;
const LAST_UPDATED_FIELD_NAME = "last_updated";
const PROJECT_ID = "clothing-assistant-b7ae8";
const BASE_URL =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents` as const;
/** Points to the database data for a user */
const USER_URL = (syncId: UUID) =>
  `${BASE_URL}/users/${encodeURIComponent(syncId)}` as const;

/** Contains all the documents representing the stored clothing data */
const USER_CLOTHING_COLLECTION_URL = (syncId: UUID) =>
  `${USER_URL(syncId)}/clothing` as const;
/** Contains fields like `last_edited`, etc */
const USER_METADATA_DOCUMENT_URL = (syncId: UUID) =>
  `${USER_CLOTHING_COLLECTION_URL(syncId)}/metadata` as const;

/** Each clothing item is stored as a document here */
const USER_CLOTHING_DOCUMENT_URL = (syncId: UUID, clothingId: UUID) =>
  `${USER_CLOTHING_COLLECTION_URL(syncId)}/${encodeURIComponent(clothingId)}` as const;

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

/** Returns all the clothing data within the database for the current sync id, i.e [ClothingDatabaseEntry, ClothingDatabaseEntry, ClothingDatabaseEntry, etc */
async function getAllClothingDocuments(
  syncId: UUID,
): Promise<(ClothingDatabaseEntry | FirestoreDocument)[]> {
  return (
    await fetch(USER_CLOTHING_COLLECTION_URL(syncId), {
      headers: await SHARED_HEADERS(),
    })
  ).json();
}

async function getClothing(
  syncId: UUID,
  clothingId: UUID,
): Promise<ClothingDatabaseEntry> {
  return (
    await fetch(USER_CLOTHING_DOCUMENT_URL(syncId, clothingId), {
      headers: await SHARED_HEADERS(),
    })
  ).json();
}

async function addClothingItemDoc(args: {
  syncId: UUID;
  clothingId: UUID;
  fieldsToAdd: ClothingDatabaseEntry;
  shouldUpdate?: boolean;
}) {
  const { syncId, clothingId, fieldsToAdd, shouldUpdate } = args;

  if (!(await gIsUserConnectedToInternet())) {
    setTimeout(
      () =>
        gTriggerAlert(
          gEnumStatus.INFO,
          "No connection detected. Sync scheduled for when next connected.",
        ),
      1000,
    );

    if (!gClothingItemStore.pendingUpload[0].find((val) => val == clothingId))
      gClothingItemStore.pendingUpload[1]([
        ...gClothingItemStore.pendingUpload[0],
        clothingId,
      ]);

    return;
  }

  const resJson = (
    await fetch(USER_CLOTHING_DOCUMENT_URL(syncId, clothingId), {
      headers: await SHARED_HEADERS(),
      method: !shouldUpdate ? "PATCH" : "POST",
      body: JSON.stringify(fieldsToAdd),
    })
  ).json();

  // Update the last time the db was modified.
  // I know that Firestore auto-saves when it was modified but due to latency and stuff, it's not reliable for my use case (it's normally around a second or 2 off)
  await fetch(USER_METADATA_DOCUMENT_URL(syncId), {
    headers: await SHARED_HEADERS(),
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        [LAST_UPDATED_FIELD_NAME]: fieldsToAdd.fields.dateEdited,
      },
    } as FirestoreDocument),
  });

  return resJson;
}

async function addClothing(
  syncId: UUID,
  clothingItem: SerializableClothingDatabaseItem,
) {
  try {
    const resJson: ClothingDatabaseEntry = await addClothingItemDoc({
      syncId,
      clothingId: clothingItem.id,
      fieldsToAdd: {
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
    });

    console.log("Document written. Response JSON is: ", resJson);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

/** Returns `true` if the document has been deleted. */
async function removeClothing(syncId: UUID, clothingId: UUID) {
  return (
    await fetch(USER_CLOTHING_DOCUMENT_URL(syncId, clothingId), {
      headers: await SHARED_HEADERS(),
      method: "DELETE",
    })
  ).ok;
}

/** Compares the last time the clothing (in the in-memory) store was updated against the server database's and retrieves every clothing item that has been added, removed, or edited. */
async function getClothingUpdates(syncId: UUID) {
  if (await gIsUserConnectedToInternet()) {
    const query: StructuredQuery<ClothingDatabaseEntry> = {
      from: [{ collectionId: SYNC_ID(), allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: "dateEdited" },
          op: "GREATER_THAN",
          value: {
            timestampValue: gClothingItemStore.lastEdited.toISOString(),
          },
        },
      },
      orderBy: [
        {
          field: { fieldPath: "dateEdited" },
          direction: "DESCENDING",
        },
      ],
    };

    fetch(`${BASE_URL}:runQuery`, {
      method: "POST",
      headers: await SHARED_HEADERS(),
      body: JSON.stringify(query),
    }).then(async (response) =>
      console.log(`Query result is: `, await response.json()),
    );

    console.log(
      `Entire collection is: `,
      await getAllClothingDocuments(syncId),
    );
  }
}

/** Global methods solely for interacting with Firebase FireStore */
const gFirebaseFunctions = {
  getClothing,
  addClothing,
  removeClothing,
  getClothingUpdates,
} as const;

export default gFirebaseFunctions;
