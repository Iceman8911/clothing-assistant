//@ts-expect-error
import cloudmersiveValidateApiClient from "cloudmersive-image-api-client";

const defaultClient = cloudmersiveValidateApiClient.ApiClient.instance;
const Apikey = defaultClient.authentications["Apikey"];
Apikey.apiKey = "";

var api = new cloudmersiveValidateApiClient.RecognizeApi();
console.group(api);
