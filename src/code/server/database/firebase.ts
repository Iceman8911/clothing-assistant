"use server";
import type {
  SerializableClothingDatabaseItem,
  ClothingItem,
} from "../../classes/clothing";
import { gIsUserConnectedToInternet } from "../../functions";
import { type gClothingItemStore } from "../../variables";
import { gEnumClothingConflictReason, gEnumStatus } from "../../enums";
import { UUID } from "../../types";
import { gTriggerAlert } from "~/components/shared/alert-toast";

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
 * Represents a Firestore document data structure for uploads in for REST API operations.
 */
interface FirestoreDocumentUpload {
  fields: {
    [fieldName: string]: FirestoreFieldValue;
  };
}

/** The format we receive when getting a document from firestore */
interface FirestoreDocumentDownload<
  TFirestorDocumentUploadType extends
    FirestoreDocumentUpload = FirestoreDocumentUpload,
> {
  /** The path that leads to the document

  e.g `projects/clothing-assistant-b7ae8/databases/(default)/documents/users/2c95386d-47c1-49ea-851d-874ef5f63b22/clothing/023b0e15-45ef-4964-aa45-71ed4269e69e` */
  name: string;
  fields: TFirestorDocumentUploadType["fields"];
  /** Date ISO string */
  createTime: string;
  /** Date ISO string */
  updateTime: string;
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
type MapValue = { mapValue: FirestoreDocumentUpload };
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
interface ClothingDatabaseEntry extends FirestoreDocumentUpload {
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
    imgUrl: StringValue;
  };
}

interface StructuredQuery<TFirestoreDocument extends FirestoreDocumentUpload> {
  from: CollectionSelector[];
  where?: Filter<TFirestoreDocument>;
  orderBy?: Order<TFirestoreDocument>[];
  limit?: number;
}

interface CollectionSelector {
  collectionId?: string;
  /** Perfom the query on all descendants of the given collection */
  allDescendants?: boolean;
}

interface Filter<TFirestoreDocument extends FirestoreDocumentUpload> {
  fieldFilter?: FieldFilter<TFirestoreDocument>;
}

interface FieldFilter<TFirestoreDocument extends FirestoreDocumentUpload> {
  field: { fieldPath: keyof TFirestoreDocument["fields"] };
  op: "GREATER_THAN" | "LESS_THAN" | "EQUAL" | "ARRAY_CONTAINS";
  value: FirestoreFieldValue;
}

interface Order<TFirestoreDocument extends FirestoreDocumentUpload> {
  field: { fieldPath: keyof TFirestoreDocument["fields"] };
  direction: "ASCENDING" | "DESCENDING";
}

const LAST_UPDATED_FIELD_NAME = "last_updated";
const METADATA_DOCUMENT_NAME = "metadata";
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
  `${USER_CLOTHING_COLLECTION_URL(syncId)}/${METADATA_DOCUMENT_NAME}` as const;

/** Each clothing item is stored as a document here */
const USER_CLOTHING_DOCUMENT_URL = (syncId: UUID, clothingId: UUID) =>
  `${USER_CLOTHING_COLLECTION_URL(syncId)}/${encodeURIComponent(clothingId)}` as const;

const Auth: { _res: AnonSignUpResponse | null; token: Promise<string> } = {
  /** Cached response */
  _res: null,
  get token() {
    const fetcher = async (): Promise<AnonSignUpResponse> => {
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
    };
    if (!this._res) {
      return fetcher().then((data) => {
        this._res = data;

        setTimeout(
          () => {
            // Remove the cache when the token expires
            this._res = null;
          },
          parseInt(data.expiresIn) * 1000,
        );

        return data.idToken;
      });
    } else {
      return Promise.resolve(this._res.idToken);
    }
  },
};

const SHARED_HEADERS = async () => {
  return {
    Authorization: `Bearer ${await Auth.token}`,
    "Content-Type": "application/json",
  } as const;
};

/** Returns all the clothing data within the database for the current sync id, i.e [ClothingDatabaseEntry, ClothingDatabaseEntry, ClothingDatabaseEntry, etc */
async function getAllClothingDocuments(syncId: UUID): Promise<{
  documents: FirestoreDocumentDownload<ClothingDatabaseEntry>[];
}> {
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

  const resJson = (
    await fetch(USER_CLOTHING_DOCUMENT_URL(syncId, clothingId), {
      headers: await SHARED_HEADERS(),
      method: shouldUpdate ? "PATCH" : "POST",
      body: JSON.stringify(fieldsToAdd),
    })
  ).json();

  // Update the last time the db was modified.
  // I know that Firestore auto-saves when it was modified but due to latency and stuff, it's not reliable for my use case (it's normally around a second or 2 off)
  await fetch(USER_METADATA_DOCUMENT_URL(syncId), {
    headers: await SHARED_HEADERS(),
    // method: shouldUpdate ? "PATCH" : "POST",
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        [LAST_UPDATED_FIELD_NAME]: fieldsToAdd.fields.dateEdited,
      },
    } as FirestoreDocumentUpload),
  });

  return resJson;
}

async function addClothing(
  syncId: UUID,
  clothingItem: SerializableClothingDatabaseItem,
) {
  try {
    let shouldUpdate = false;

    try {
      shouldUpdate = (await getClothing(syncId, clothingItem.id)).fields.name
        ? true
        : false;
    } catch (e) {
      // The clothing item doesn't exist
      shouldUpdate = false;
    }

    // NOTE: For some reason, all POST requests fail :(. Maybe moving over to the SDK would be better.
    shouldUpdate = true;

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
          dateBought: {
            timestampValue: clothingItem.dateBought.toISOString(),
          },
          dateEdited: {
            timestampValue: clothingItem.dateEdited.toISOString(),
          },
          description: { stringValue: clothingItem.description },
          gender: { stringValue: clothingItem.gender },
          imgUrl: { stringValue: clothingItem.imgUrl },
          material: { stringValue: clothingItem.material },
          name: { stringValue: clothingItem.name },
          occasion: {
            mapValue: {
              fields: {
                activeWear: {
                  booleanValue: clothingItem.occasion.activeWear,
                },
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
      shouldUpdate,
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

export type ClothingConflict =
  | {
      client: SerializableClothingDatabaseItem;
      server: ClothingDatabaseEntry;
      reason:
        | gEnumClothingConflictReason.CLIENT_HAS_NEWER
        | gEnumClothingConflictReason.SERVER_HAS_NEWER;
    }
  | {
      client: SerializableClothingDatabaseItem;
      reason: gEnumClothingConflictReason.MISSING_ON_SERVER;
    }
  | {
      server: ClothingDatabaseEntry;
      reason: gEnumClothingConflictReason.MISSING_ON_CLIENT;
    };

type ClothingConflictMap = Map<UUID, ClothingConflict>;
/** Compares the last time the clothing (in the in-memory) store was updated against the server database's and retrieves every clothing item that has been added, removed, or edited. */
async function getClothingUpdates(
  syncId: UUID,
  clientSideClothingItems: Map<UUID, Promise<SerializableClothingDatabaseItem>>,
): Promise<ClothingConflictMap> {
  if (await gIsUserConnectedToInternet()) {
    // REVIEW: Looks like I have to manually create indexes via the Firebase dashboard so that the queries would work but that's an issue for future me. The other workaround though, would just be to fetch all the clothing items and do comparisons, I believe that 4000 items shouldn't amount to >300~400kb if I'm lucky.
    // const query: StructuredQuery<ClothingDatabaseEntry> = {
    //   // from: [{ collectionId: syncId, allDescendants: true }],
    //   from: [{ allDescendants: true }],
    //   where: {
    //     fieldFilter: {
    //       field: { fieldPath: "dateEdited" },
    //       // op: "GREATER_THAN",
    //       op: "LESS_THAN",
    //       value: {
    //         timestampValue: timeStampToCompare,
    //       },
    //     },
    //   },
    //   orderBy: [
    //     {
    //       field: { fieldPath: "dateEdited" },
    //       direction: "DESCENDING",
    //     },
    //   ],
    // };
    // fetch(`${BASE_URL}:runQuery`, {
    //   method: "POST",
    //   headers: await SHARED_HEADERS(),
    //   body: JSON.stringify({
    //     structuredQuery: query,
    //   }),
    // }).then(async (response) =>
    //   console.log(`Query result is: `, await response.json()),
    // );

    /** We can get the orignal clothing ids by using the ending string (after the last forward slash). Note that one of the documents represents "metadata" so it should be ignored */
    const fetchedDocuments = (await getAllClothingDocuments(syncId)).documents;
    if (!fetchedDocuments?.length) return new Map();

    const conflictingClothingItems: ClothingConflictMap = new Map();

    for (let i = 0, len = fetchedDocuments.length; i < len; i++) {
      const doc = fetchedDocuments[i];
      const possibleId = doc.name.slice(doc.name.lastIndexOf("/") + 1);

      if (possibleId != METADATA_DOCUMENT_NAME) {
        // Now we're sure that this is our ID
        const id = possibleId as UUID;
        const localClothingItem = await clientSideClothingItems.get(id);

        // Remove the item so that at the end we can get all the items missing on the server
        clientSideClothingItems.delete(id);

        // Server has data not in the client
        if (!localClothingItem) {
          conflictingClothingItems.set(id, {
            server: doc,
            reason: gEnumClothingConflictReason.MISSING_ON_CLIENT,
          });
          continue;
        }

        const serverClothingItemDate = new Date(
          doc.fields.dateEdited.timestampValue,
        );

        // Compare the local clothing with the data from the server
        if (localClothingItem.dateEdited > serverClothingItemDate) {
          conflictingClothingItems.set(id, {
            server: doc,
            client: localClothingItem,
            reason: gEnumClothingConflictReason.CLIENT_HAS_NEWER,
          });
        } else if (localClothingItem.dateEdited < serverClothingItemDate) {
          conflictingClothingItems.set(id, {
            server: doc,
            client: localClothingItem,
            reason: gEnumClothingConflictReason.SERVER_HAS_NEWER,
          });
        }
      }
    }

    clientSideClothingItems.forEach(async (data, id) => {
      conflictingClothingItems.set(id, {
        client: await data,
        reason: gEnumClothingConflictReason.MISSING_ON_SERVER,
      });
    });

    return conflictingClothingItems;
  }

  return new Map();
}

/** Global methods solely for interacting with Firebase FireStore */
const gFirebaseServerFunctions = {
  getClothing,
  addClothing,
  removeClothing,
  getClothingUpdates,
} as const;

export default gFirebaseServerFunctions;
