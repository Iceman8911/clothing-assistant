"use server";
import { deleteApp, type FirebaseApp, initializeApp } from "firebase/app";
import {
	type Auth as FirebaseAuth,
	getAuth,
	signInAnonymously,
	type User,
} from "firebase/auth";
import {
	collection,
	deleteDoc,
	doc,
	type Firestore,
	getDoc,
	getDocs,
	initializeFirestore,
	setDoc,
	Timestamp,
} from "firebase/firestore";
import type {
	ClothingItem,
	SerializableClothingDatabaseItem,
} from "../../classes/clothing";
import { gEnumClothingConflictReason } from "../../enums";
import type { UUID } from "../../types";
import gCloudinaryServerFunctions from "../file-hosting/cloudinary";

// Firebase configuration
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	projectId: "clothing-assistant-b7ae8",
};

const METADATA_DOCUMENT_NAME = "metadata";
const LAST_UPDATED_FIELD_NAME = "last_updated";

type OmitProps<
	TObjectType extends object,
	TPropToOmit extends keyof TObjectType,
> = Omit<TObjectType, TPropToOmit>;

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

type SerializableClothingDocument = OmitProps<
	ClothingDocument,
	"dateBought" | "dateEdited"
> & { dateBought: Date; dateEdited: Date };

function serializeClothingDocument(
	doc: ClothingDocument,
): SerializableClothingDocument {
	return {
		...doc,
		dateEdited: doc.dateEdited.toDate(),
		dateBought: doc.dateBought.toDate(),
	};
}

// Initialize Firebase per request
function initializeFirebase() {
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

	// Configure Firestore for serverless environment
	const db = initializeFirestore(app, {
		experimentalForceLongPolling: true,
		experimentalAutoDetectLongPolling: false,
	});

	return { app, auth, db };
}

// Cleanup Firebase after each request
async function cleanupFirebase(app: FirebaseApp) {
	try {
		await deleteApp(app);
	} catch (e) {
		console.warn("Firebase cleanup warning:", e);
	}
}

// Cache authentication per request
let authPromise: Promise<User> | null = null;

async function ensureAuthenticated(auth: FirebaseAuth) {
	if (auth.currentUser) return auth.currentUser;

	if (!authPromise) {
		authPromise = signInAnonymously(auth)
			.then((credential) => credential.user)
			.catch((error) => {
				authPromise = null;
				throw error;
			});
	}

	return authPromise;
}

function getUserClothingCollection(db: Firestore, syncId: UUID) {
	return collection(db, "users", syncId, "clothing");
}

function getClothingDocRef(db: Firestore, syncId: UUID, clothingId: UUID) {
	return doc(getUserClothingCollection(db, syncId), clothingId);
}

function getMetadataDocRef(db: Firestore, syncId: UUID) {
	return doc(getUserClothingCollection(db, syncId), METADATA_DOCUMENT_NAME);
}

async function getAllClothingDocuments(
	db: Firestore,
	auth: FirebaseAuth,
	syncId: UUID,
) {
	await ensureAuthenticated(auth);
	const snapshot = await getDocs(getUserClothingCollection(db, syncId));

	return snapshot.docs
		.filter((doc) => doc.id !== METADATA_DOCUMENT_NAME)
		.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
}

async function getClothing(syncId: UUID, clothingId: UUID) {
	const { app, auth, db } = initializeFirebase();
	try {
		await ensureAuthenticated(auth);
		const docRef = getClothingDocRef(db, syncId, clothingId);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			throw new Error(`Clothing item ${clothingId} not found`);
		}

		return serializeClothingDocument(docSnap.data() as ClothingDocument);
	} finally {
		await cleanupFirebase(app);
	}
}

async function addClothing(
	syncId: UUID,
	clothingItem: SerializableClothingDatabaseItem,
) {
	const { app, auth, db } = initializeFirebase();
	try {
		await ensureAuthenticated(auth);

		const docRef = getClothingDocRef(db, syncId, clothingItem.id);
		const metadataRef = getMetadataDocRef(db, syncId);

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
			imgUrl: clothingItem.imgFile
				? await gCloudinaryServerFunctions.uploadImage(
						`data:image/png;base64,${new Buffer(clothingItem.imgFile).toString(
							"base64",
						)}`,
						clothingItem.id,
						clothingItem.name,
					)
				: "",
			material: clothingItem.material,
			occasion: clothingItem.occasion,
			quantity: clothingItem.quantity,
			season: clothingItem.season,
			sellingPrice: clothingItem.sellingPrice,
			size: clothingItem.size,
			subCategory: clothingItem.subCategory,
		};

		await setDoc(docRef, clothingDoc, { merge: true });

		await setDoc(
			metadataRef,
			{
				[LAST_UPDATED_FIELD_NAME]: Timestamp.fromDate(clothingItem.dateEdited),
			},
			{ merge: true },
		);
	} catch (e) {
		console.error("Firebase error:", e);
		throw e;
	} finally {
		await cleanupFirebase(app);
	}
}

async function removeClothing(syncId: UUID, clothingId: UUID) {
	const { app, auth, db } = initializeFirebase();
	try {
		await ensureAuthenticated(auth);
		const docRef = getClothingDocRef(db, syncId, clothingId);
		await deleteDoc(docRef);
		return true;
	} finally {
		await cleanupFirebase(app);
	}
}

// type ClientClothingTimeStamp = {
//   id: UUID;
//   dateEdited: Date;
// };

export type ClothingConflict =
	| {
			reason:
				| gEnumClothingConflictReason.CLIENT_HAS_NEWER
				| gEnumClothingConflictReason.SERVER_HAS_NEWER;
			server: SerializableClothingDocument;
	  }
	| {
			reason: gEnumClothingConflictReason.MISSING_ON_SERVER;
	  }
	| {
			reason: gEnumClothingConflictReason.MISSING_ON_CLIENT;
			server: SerializableClothingDocument;
	  };

type ClothingConflictMap = Map<UUID, ClothingConflict>;

async function getClothingUpdates(
	syncId: UUID,
	clientSideClothingTimestamps: Map<UUID, Date>,
): Promise<ClothingConflictMap> {
	const { app, auth, db } = initializeFirebase();
	try {
		await ensureAuthenticated(auth);
		const conflictingClothingItems: ClothingConflictMap = new Map();

		// Process server documents
		const serverDocs = await getAllClothingDocuments(db, auth, syncId);
		const processedIds = new Set<UUID>();

		for (const doc of serverDocs) {
			const id = doc.id as UUID;
			processedIds.add(id);

			const localClothingItemTimestamp = clientSideClothingTimestamps.get(id);
			clientSideClothingTimestamps.delete(id);

			const serverDoc = serializeClothingDocument(
				doc as unknown as ClothingDocument,
			);

			if (!localClothingItemTimestamp) {
				conflictingClothingItems.set(id, {
					server: serverDoc,
					reason: gEnumClothingConflictReason.MISSING_ON_CLIENT,
				});
				continue;
			}

			const serverTimestamp = (
				doc as unknown as ClothingDocument
			).dateEdited.toDate();

			if (localClothingItemTimestamp > serverTimestamp) {
				conflictingClothingItems.set(id, {
					server: serverDoc,
					reason: gEnumClothingConflictReason.CLIENT_HAS_NEWER,
				});
			} else if (localClothingItemTimestamp < serverTimestamp) {
				conflictingClothingItems.set(id, {
					server: serverDoc,
					reason: gEnumClothingConflictReason.SERVER_HAS_NEWER,
				});
			}
		}

		// Process remaining client items
		for (const [id, _] of clientSideClothingTimestamps) {
			if (!processedIds.has(id)) {
				conflictingClothingItems.set(id, {
					reason: gEnumClothingConflictReason.MISSING_ON_SERVER,
				});
			}
		}

		return conflictingClothingItems;
	} finally {
		await cleanupFirebase(app);
	}
}

const gFirebaseServerFunctions = {
	getClothing,
	addClothing,
	removeClothing,
	getClothingUpdates,
} as const;

export default gFirebaseServerFunctions;
