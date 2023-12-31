import { createDrawerNavigator } from "@react-navigation/drawer";
import LeftDrawerContent from "./LeftDrawerContent";
import RightDrawerScreen from "./RighDrawerScreen";
import { WorkspaceIdContext } from "../../hook/WorkspaceContext";
import { currentChannelIdContext } from "../../hook/ChannelContext";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { setConnectionChatChannel } from "../../globalVar/global";
import StatusSnackBar from "../../components/StatusSnackBar";

const LeftDrawer = createDrawerNavigator();

export default function LeftDrawerScreen({ route }) {
  const { workspaceId, setSnackBarWpList } = route.params;
  const [currentChannelId, setCurrentChannelId] = useState("");
  const [channels, setChannels] = useState([]);
  const [snackBarChannel, setSnackBarChannel] = useState({ isVisible: false, message: "", type: "blank" });

  return (
    <>
      <WorkspaceIdContext.Provider value={workspaceId}>
        <currentChannelIdContext.Provider
          value={{
            currentChannelId, setCurrentChannelId,
            channels, setChannels, setSnackBarChannel,
          }}
        >
          <LeftDrawer.Navigator
            id="LeftDrawer"
            initialRouteName="CurrentChannel"
            screenOptions={{ drawerPosition: "left", headerShown: false }}
            drawerContent={(props) =>
              <LeftDrawerContent {...props}
                setSnackBarWpList={setSnackBarWpList}
              />}
          >
            <LeftDrawer.Screen name="RightDrawer" component={RightDrawerScreen} />
          </LeftDrawer.Navigator>
        </currentChannelIdContext.Provider>
      </WorkspaceIdContext.Provider>
      <StatusSnackBar snackBar={snackBarChannel} setSnackBar={setSnackBarChannel} />
    </>
  );
}
