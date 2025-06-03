import gCloudinaryServerFunctions from "./cloudinary";

const uploadImg = (
  ...args: Parameters<typeof gCloudinaryServerFunctions.uploadImage>
) => {
  "use server";
  return gCloudinaryServerFunctions.uploadImage(...args);
};

const getImg = (
  ...args: Parameters<typeof gCloudinaryServerFunctions.getImage>
) => {
  "use server";
  return gCloudinaryServerFunctions.getImage(...args);
};

const deleteImg = (
  ...args: Parameters<typeof gCloudinaryServerFunctions.deleteImage>
) => {
  "use server";
  return gCloudinaryServerFunctions.deleteImage(...args);
};

const gCloudinaryClientFunctions = {
  uploadImg,
  getImg,
  deleteImg,
} as const;

export default gCloudinaryClientFunctions;
