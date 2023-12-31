import { general } from "../../styles/styles";
import { useState } from "react";
import { Alert } from "react-native";
import updateWpApi from "../../api/workspaceApi/updateWp.api";
import updateWpAvatarApi from "../../api/workspaceApi/updateWpAvatar.api";

import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import getWpbyIdApi from "../../api/workspaceApi/getWpbyId.api";
import { useEffect } from "react";
import {
  buttonColor,
  cancelButtonColor,
  textInputColor,
} from "../../styles/colorScheme";
import StatusSnackBar from "../../components/StatusSnackBar";

export default function WorkspaceOverview({ navigation, route }) {
  const { workspaceId } = route.params;
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clicked, setClicked] = useState(false);
  const [snackBar, setSnackBar] = useState({ isVisible: false, message: "", type: "blank" });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(function () {
    try {
      const getWorkspace = async () => {
        const workspace = await getWpbyIdApi(workspaceId);
        setImage(workspace.avatarUrl);
        setName(workspace.name);
        setDescription(workspace.description);
      };
      getWorkspace();
    } catch (error) {
      setSnackBar({ isVisible: true, message: "get workspace failed", type: "failed" });
    }
  }, []);
  const onChangeName = (text) => {
    setName(text);
  };

  const onChangeDescription = (text) => {
    setDescription(text);
  };

  async function onPressUpdate() {
    try {
      setClicked(true);
      if (name == "" || name.length < 8) {
        setSnackBar({ isVisible: true, message: "Workspace name cannot less than 8 characters", type: "failed" });
        setClicked(false);
        return;
      }
      const responseNotImg = await updateWpApi(workspaceId, name, description);
      const responseImg = await updateWpAvatarApi(workspaceId, image);
      if (responseImg.status != 200 && responseNotImg != 200) {
        setSnackBar({ isVisible: true, message: "you are not authorized to update this workspace", type: "failed" });
        setClicked(false);
        return;
      }
      setSnackBar({ isVisible: true, message: "update this workspace successfully", type: "success" });
      setClicked(false);
    } catch (error) {
      setSnackBar({ isVisible: true, message: "failed this workspace", type: "failed" });
      setClicked(false);
    }
  }

  return (
    <>
      <View style={general.centerView}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
        >
          <TouchableOpacity onPress={pickImage} style={styles.imageTouchable}>
            <Image
              source={
                image ? { uri: image } : require("../../assets/imageholder.png")
              }
              style={{ width: 150, height: 150 }}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}></View>
        </View>
        <TextInput
          {...textInputColor}
          label="workspace name"
          mode="outlined"
          style={{ marginBottom: 30, width: "80%", backgroundColor: "white" }}
          onChangeText={onChangeName}
          value={name}
        />
        <TextInput
          {...textInputColor}
          label="description"
          mode="outlined"
          style={{ marginBottom: 20, width: "80%", backgroundColor: "white" }}
          multiline={true}
          numberOfLines={8}
          onChangeText={onChangeDescription}
          value={description}
        />
        <View
          style={{
            flexDirection: "row",
            alignSelf: "flex-end",
            marginRight: 40,
          }}
        >
          <Button
            {...cancelButtonColor}
            mode="contained"
            style={{ width: "30" }}
            onPress={() => navigation.goBack()}
            disabled={clicked}
          >
            Cancel
          </Button>
          <Button
            {...buttonColor}
            mode="contained"
            style={{ marginLeft: 20, marginRight: 10, width: "30" }}
            onPress={onPressUpdate}
            disabled={clicked}
            loading={clicked}
          >
            Ok
          </Button>
        </View>
      </View>
      <StatusSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  imageTouchable: {
    marginLeft: 50,
    borderWidth: 1,
    padding: 3,
    borderRadius: 5,
    borderStyle: "dashed",
  },
  saveImage: { width: "60%", borderRadius: 8 },
  divider: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 0.8,
  },
  headerText: { marginBottom: 20, fontSize: 18 },
});
