"use server";
import { v2 as cloudinary } from "cloudinary";
import { UUID } from "../types";

/** If succesful, returns the url to the uploaded file */
const uploadImage = async (
  /** Base 64 string */
  imgData: string,
  id: UUID,
  name?: string,
) => {
  return (
    await cloudinary.uploader.upload(imgData, {
      public_id: id,
      resource_type: "image",
      overwrite: true,
      filename_override: name,
      use_filename: name ? true : false,
      folder: "clothing",
    })
  ).secure_url;
};

const gCloudinaryFunctions = {
  uploadImage,
} as const;

export default gCloudinaryFunctions;
