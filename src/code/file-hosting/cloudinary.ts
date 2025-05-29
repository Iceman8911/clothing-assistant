"use server";
import { v2 as cloudinary } from "cloudinary";
import { UUID } from "../types";

const FOLDER = "clothing";
/** Since I also need to specify the folder :p */
const completePublicId = (id: UUID) => `${FOLDER}/${id}` as const;

/** If succesful, returns the url to the uploaded file */
const uploadImage = async (
  /** Base 64 string */
  imgData: string,
  id: UUID,
  /** Used in determining the folder to store the image as well as determining when to update the image client-side */
  // date: Date,
  name?: string,
) => {
  const resultUrl = (
    await cloudinary.uploader.upload(imgData, {
      public_id: id,
      resource_type: "image",
      overwrite: true,
      filename_override: name,
      // use_filename: name ? true : false,
      folder: FOLDER,
    })
  ).secure_url;

  // Further optimize the image if possible
  cloudinary.image(id, { quality: "auto" });

  return resultUrl;
};

/** Returns a blob containing the request image */
const getImage = async (id: UUID) => {
  try {
    return (
      await fetch(
        (await cloudinary.api.resource(completePublicId(id))).secure_url,
      )
    ).blob();
  } catch (error) {
    console.log(
      "DA ERROR IS: ",
      error,
      " The actual resources are: ",
      await cloudinary.api.resources(),
    );
  }
};

const deleteImage = async (id: UUID) => {
  return cloudinary.uploader.destroy(completePublicId(id));
};

const gCloudinaryFunctions = {
  getImage,
  uploadImage,
  deleteImage,
} as const;

export default gCloudinaryFunctions;
