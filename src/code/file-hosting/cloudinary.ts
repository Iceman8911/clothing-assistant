"use server";
import { v2 as cloudinary } from "cloudinary";
import { UUID } from "../types";

/** If succesful, returns the url to the uploaded file */
const uploadImage = async (
  /** Base 64 string */
  imgData: string,
  id: UUID,
  /** Used in determining the folder to store the image as well as determining when to update the image client-side */
  // date: Date,
  name?: string,
) => {
  return (
    await cloudinary.uploader.upload(imgData, {
      public_id: id,
      resource_type: "image",
      overwrite: true,
      filename_override: name,
      // use_filename: name ? true : false,
      folder: "clothing",
    })
  ).secure_url;
};

const getImage = async (id: UUID) => {
  return cloudinary.api.resource(id);
};

const deleteImage = async (id: UUID) => {
  return cloudinary.uploader.destroy(id);
};

const gCloudinaryFunctions = {
  getImage,
  uploadImage,
  deleteImage,
} as const;

export default gCloudinaryFunctions;
