"use server";
import { v2 as cloudinary } from "cloudinary";

/** If succesful, returns the url to the uploaded file */
const uploadImage = async (
  /** Base 64 string */
  imgData: string,
  fileName: string,
) => {
  return cloudinary.uploader.upload(imgData, {
    filename_override: fileName,
    resource_type: "image",
    overwrite: true,
  });
};

const gCloudinaryFunctions = {
  uploadImage,
} as const;

export default gCloudinaryFunctions;
