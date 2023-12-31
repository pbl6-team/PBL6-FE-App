import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (keyword, numberOfResults) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
    const response = await fetch(baseUrl + "User/search/" + keyword + "/" + numberOfResults, {
      method: "GET",
      headers: {
        "x-apikey": apiKey,
        "content-type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + userToken,
        // keyword: keyword,
      }
    });
    if (response.ok) return response.json();
    return response;
  } catch (error) {
    return error;
  }
};
