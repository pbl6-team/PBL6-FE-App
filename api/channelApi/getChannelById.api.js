import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (channelId) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
    const response = await fetch(baseUrl + "Channel/" + channelId, {
      method: "GET",
      headers: {
        "x-apikey": apiKey,
        "content-type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + userToken,
				"channel-id": channelId,
      },
    });
    if (response.ok) return response.json();
    return response;
  } catch (error) {
    return error;
  }
};
