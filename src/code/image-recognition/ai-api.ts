//@ts-expect-error
import cloudmersiveValidateApiClient from "cloudmersive-image-api-client";
import { gApiKeys } from "../shared";

type Callback = (
	error: Error,
	result: { [key: string]: any },
	response: Response
) => void;
type RecogniseDescribeAPI = (imageFile: string, callback: Callback) => void;

function initCloudmersive(): any {
	const defaultClient = cloudmersiveValidateApiClient.ApiClient.instance;
	const Apikey = defaultClient.authentications["Apikey"];
	Apikey.apiKey = gApiKeys.cloudmersive;

	return new cloudmersiveValidateApiClient.RecognizeApi();
}

export const recognizeDescribeApi: RecogniseDescribeAPI = (
	imageFile,
	callback
) => {
	const api = initCloudmersive();

	api.recognizeDescribe(imageFile, callback);
};
