import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (workspaceId, channelId, name, description) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
    const response = await fetch(baseUrl + "Channel/" + channelId, {
      method: "PUT",
      headers: {
        "x-apikey": apiKey,
        "content-type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + userToken,
        "workspace-id": workspaceId,
        "channel-id": channelId,
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    });
    return response;
  } catch (error) {
    return error;
  }
};
