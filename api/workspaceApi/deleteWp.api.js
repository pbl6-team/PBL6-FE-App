import { apiKey, baseUrl } from "../constant.api";
import * as SecureStore from "expo-secure-store";

export default async (workspaceId) => {
  try {
    const userToken = await SecureStore.getItemAsync("userToken");
    const response = await fetch(baseUrl + "Workspace/" + workspaceId, {
      method: "DELETE",
      headers: {
        "x-apikey": apiKey,
        "content-type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + userToken,
        "workspaceid": workspaceId,
        "workspace-id": workspaceId,
      },
    });
		console.log(response.status);
    return response;
  } catch (error) {
    return error;
  }
};
