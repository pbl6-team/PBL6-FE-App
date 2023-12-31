import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (userId, imageUri) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
		console.log(imageUri);
    const image = {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    };
    let formData = new FormData();
    formData.append("Picture", image);
    const response = await fetch(
      baseUrl + "User/" + userId + "/picture",
      {
        method: "PUT",
        headers: {
          "x-apikey": apiKey,
          "content-type": "multipart/form-data",
          accept: "application/json",
          authorization: "Bearer " + userToken,
					"userId": userId,
        },
        body: formData,
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};
