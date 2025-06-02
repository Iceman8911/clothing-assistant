"use server";
import { v2 as cloudinary, SignApiOptions } from "cloudinary";
import { UUID } from "../../types";

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
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL environment variable is not set.");
  }

  // Parse the Cloudinary URL to extract credentials
  const url = new URL(cloudinaryUrl);
  const apiKey = url.username;
  const apiSecret = url.password;
  const cloudName = url.hostname;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error(
      "Invalid CLOUDINARY_URL format. Expected cloudinary://<api_key>:<api_secret>@<cloud_name>",
    );
  }

  // Prepare parameters for the Cloudinary upload API call
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params: SignApiOptions = {
    timestamp: timestamp,
    public_id: id,
    // resource_type: "image",
    overwrite: true,
    folder: FOLDER,
  };

  if (name) {
    params.filename_override = name;
    // params.use_filename = true; // Cloudinary recommends filename_override
  }

  // Generate signature using the Cloudinary SDK utility
  // This utility function should be compatible as it's a local calculation, not making network calls directly
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  console.log("Signature is:", signature);

  // Add API key and signature to parameters for the fetch request body
  params.api_key = apiKey;
  params.signature = signature;

  // Prepare the form data for the multipart/form-data request
  const formData = new FormData();
  // Cloudinary expects the file data under the 'file' key
  // imgData should be in a data URL format like "data:image/png;base64,..."
  formData.append("file", imgData);

  // Append all parameters including API key and signature
  for (const key in params) {
    // FormData values must be strings or Blobs/Files. Ensure conversion.
    formData.append(key, String(params[key]));
  }

  // Construct the Cloudinary upload URL
  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` as const;

  try {
    // Use fetch API to send the POST request
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Attempt to parse the error response from Cloudinary
      let errorDetails = `Cloudinary upload failed: ${response.status} - ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorDetails += ` - ${errorResult.error?.message || JSON.stringify(errorResult)}`;
      } catch (jsonError) {
        // Fallback to plain text if JSON parsing fails
        const textError = await response.text();
        errorDetails += ` - ${textError}`;
      }
      throw new Error(errorDetails);
    }

    // Parse the successful response
    const result = await response.json();
    const resultUrl = result.secure_url;

    cloudinary.image(id, { quality: "auto" });

    return resultUrl;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    // Re-throw the error to propagate it to the caller
    // throw error;
  }
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
