import { SerializableClothingDatabaseItem } from "~/code/classes/clothing";
import { UUID } from "~/code/types";
import gFirebaseServerFunctions from "./firebase";

const getClothing = async (syncId: UUID, clothingId: UUID) => {
  "use server";
  return gFirebaseServerFunctions.getClothing(syncId, clothingId);
};

const addClothing = async (
  syncId: UUID,
  clothingData: SerializableClothingDatabaseItem,
) => {
  "use server";
  return gFirebaseServerFunctions.addClothing(
    syncId,
    clothingData,
    // gClothingItemStore,
  );
};

const removeClothing = async (syncId: UUID, clothingId: UUID) => {
  "use server";
  return gFirebaseServerFunctions.removeClothing(syncId, clothingId);
};

const getClothingUpdates = async (
  syncId: UUID,
  clientSideClothingItems: Map<UUID, Promise<SerializableClothingDatabaseItem>>,
) => {
  "use server";
  return gFirebaseServerFunctions.getClothingUpdates(
    syncId,
    clientSideClothingItems,
  );
};

const gFirebaseClientFunctions = {
  getClothing,
  addClothing,
  removeClothing,
  getClothingUpdates,
} as const;

export default gFirebaseClientFunctions;
