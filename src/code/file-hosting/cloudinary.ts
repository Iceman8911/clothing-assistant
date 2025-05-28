"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
