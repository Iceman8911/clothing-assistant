import gFirebaseServerFunctions from "./firebase";

const getClothing = (
  ...args: Parameters<typeof gFirebaseServerFunctions.getClothing>
) => {
  "use server";
  return gFirebaseServerFunctions.getClothing(...args);
};

const addClothing = (
  ...args: Parameters<typeof gFirebaseServerFunctions.addClothing>
) => {
  "use server";
  return gFirebaseServerFunctions.addClothing(...args);
};

const removeClothing = (
  ...args: Parameters<typeof gFirebaseServerFunctions.removeClothing>
) => {
  "use server";
  return gFirebaseServerFunctions.removeClothing(...args);
};

const getClothingUpdates = (
  ...args: Parameters<typeof gFirebaseServerFunctions.getClothingUpdates>
) => {
  "use server";
  return gFirebaseServerFunctions.getClothingUpdates(...args);
};

const gFirebaseClientFunctions = {
  getClothing,
  addClothing,
  removeClothing,
  getClothingUpdates,
} as const;

export default gFirebaseClientFunctions;
