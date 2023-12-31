import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (Search, Offset, Limit) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
    const response = await fetch(baseUrl +
      `Messages/conversations`,
      {
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          "content-type": "application/json",
          accept: "text/plain",
          authorization: "Bearer " + userToken,
          "Search": Search,
          "Offset": Offset,
          "Limit": Limit,
        }
      });
    return response.json();
  } catch (error) {
    return error;
  }
};
