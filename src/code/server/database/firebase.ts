"use server";
import type {
  ClothingItem,
  SerializableClothingDatabaseItem,
} from "../../classes/clothing";
import { gEnumClothingConflictReason } from "../../enums";
import { gIsUserConnectedToInternet } from "../../functions";
import { UUID } from "../../types";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously,
  type Auth as FirebaseAuth 
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  type Firestore,
  type DocumentData,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: "clothing-assistant-b7ae8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const METADATA_DOCUMENT_NAME = "metadata";
const LAST_UPDATED_FIELD_NAME = "last_updated";

interface ClothingDocument {
  name: string;
  description: string;
  brand: string;
  gender: ClothingItem["gender"];
  color: string;
  material: string;
  category: ClothingItem["category"];
  subCategory: string;
  season: Record<keyof ClothingItem["season"], boolean>;
  occasion: Record<keyof ClothingItem["occasion"], boolean>;
  condition: ClothingItem["condition"];
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  size: ClothingItem["size"];
  dateBought: Timestamp;
  dateEdited: Timestamp;
  imgUrl: string;
}

async function ensureAuthenticated() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}

function getUserClothingCollection(syncId: UUID) {
  return collection(db, 'users', syncId, 'clothing');
}

function getClothingDocRef(syncId: UUID, clothingId: UUID) {
  return doc(getUserClothingCollection(syncId), clothingId);
}

function getMetadataDocRef(syncId: UUID) {
  return doc(getUserClothingCollection(syncId), METADATA_DOCUMENT_NAME);
}

async function getAllClothingDocuments(syncId: UUID) {
  await ensureAuthenticated();
  const snapshot = await getDocs(getUserClothingCollection(syncId));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function getClothing(syncId: UUID, clothingId: UUID) {
  await ensureAuthenticated();
  const docRef = getClothingDocRef(syncId, clothingId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error(`Clothing item ${clothingId} not found`);
  }
  
  return docSnap.data() as ClothingDocument;
}

async function addClothing(
  syncId: UUID,
  clothingItem: SerializableClothingDatabaseItem,
) {
  try {
    await ensureAuthenticated();
    
    const docRef = getClothingDocRef(syncId, clothingItem.id);
    const metadataRef = getMetadataDocRef(syncId);

    // Convert the clothing item to Firestore format
    const clothingDoc: ClothingDocument = {
      name: clothingItem.name,
      brand: clothingItem.brand,
      category: clothingItem.category,
      color: clothingItem.color,
      condition: clothingItem.condition,
      costPrice: clothingItem.costPrice,
      dateBought: Timestamp.fromDate(clothingItem.dateBought),
      dateEdited: Timestamp.fromDate(clothingItem.dateEdited),
      description: clothingItem.description,
      gender: clothingItem.gender,
      imgUrl: clothingItem.imgUrl,
      material: clothingItem.material,
      occasion: clothingItem.occasion,
      quantity: clothingItem.quantity,
      season: clothingItem.season,
      sellingPrice: clothingItem.sellingPrice,
      size: clothingItem.size,
      subCategory: clothingItem.subCategory,
    };

    // Set the document
    await setDoc(docRef, clothingDoc, { merge: true });

    // Update metadata
    await setDoc(metadataRef, {
      [LAST_UPDATED_FIELD_NAME]: Timestamp.fromDate(clothingItem.dateEdited)
    }, { merge: true });

    console.log("Document written successfully");
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

async function removeClothing(syncId: UUID, clothingId: UUID) {
  await ensureAuthenticated();
  const docRef = getClothingDocRef(syncId, clothingId);
  await deleteDoc(docRef);
  return true;
}

export type ClothingConflict =
  | {
      client: SerializableClothingDatabaseItem;
      server: ClothingDocument;
      reason:
        | gEnumClothingConflictReason.CLIENT_HAS_NEWER
        | gEnumClothingConflictReason.SERVER_HAS_NEWER;
    }
  | {
      client: SerializableClothingDatabaseItem;
      reason: gEnumClothingConflictReason.MISSING_ON_SERVER;
    }
  | {
      server: ClothingDocument;
      reason: gEnumClothingConflictReason.MISSING_ON_CLIENT;
    };

type ClothingConflictMap = Map<UUID, ClothingConflict>;

async function getClothingUpdates(
  syncId: UUID,
  clientSideClothingItems: Map<UUID, Promise<SerializableClothingDatabaseItem>>,
): Promise<ClothingConflictMap> {
  if (!(await gIsUserConnectedToInternet())) {
    return new Map();
  }

  await ensureAuthenticated();
  const conflictingClothingItems: ClothingConflictMap = new Map();

  // Get all server documents
  const serverDocs = await getAllClothingDocuments(syncId);
  
  // Process server documents
  for (const doc of serverDocs) {
    if (doc.id === METADATA_DOCUMENT_NAME) continue;

    const id = doc.id as UUID;
    const localClothingItemPromise = clientSideClothingItems.get(id);
    
    // Remove processed items so we can identify client-only items later
    clientSideClothingItems.delete(id);

    if (!localClothingItemPromise) {
      // Server has data not in client
      conflictingClothingItems.set(id, {
        server: doc as unknown as ClothingDocument,
        reason: gEnumClothingConflictReason.MISSING_ON_CLIENT,
      });
      continue;
    }

    const localClothingItem = await localClothingItemPromise;
    const serverDate = (doc as unknown as ClothingDocument).dateEdited.toDate();

    // Compare dates
    if (localClothingItem.dateEdited > serverDate) {
      conflictingClothingItems.set(id, {
        server: doc as unknown as ClothingDocument,
        client: localClothingItem,
        reason: gEnumClothingConflictReason.CLIENT_HAS_NEWER,
      });
    } else if (localClothingItem.dateEdited < serverDate) {
      conflictingClothingItems.set(id, {
        server: doc as unknown as ClothingDocument,
        client: localClothingItem,
        reason: gEnumClothingConflictReason.SERVER_HAS_NEWER,
      });
    }
  }

  // Process remaining client items (missing on server)
  for (const [id, itemPromise] of clientSideClothingItems) {
    conflictingClothingItems.set(id, {
      client: await itemPromise,
      reason: gEnumClothingConflictReason.MISSING_ON_SERVER,
    });
  }

  return conflictingClothingItems;
}

const gFirebaseServerFunctions = {
  getClothing,
  addClothing,
  removeClothing,
  getClothingUpdates,
} as const;

export default gFirebaseServerFunctions;