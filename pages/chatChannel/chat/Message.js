import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { SvgUri } from "react-native-svg";
import RenderHtml from "react-native-render-html";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Linking from 'expo-linking';
import * as linkify from 'linkifyjs';
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { useEffect, useState } from "react";
import { getShortDatetimeSendAt, truncString } from "../../../utils/common";
import UserInformationModal from "../../../components/UserInformationModal";
import MeetingInfoModal from "../../../components/MeetingInfoModal";

export default function Message({
  currentChannelId,
  resetParentMessageRef,
  reactionCount,
  navigation,
  state,
  childCount,
  setModalId,
  id,
  setModalVisible,
  content,
  senderId,
  selectedUserRef,
  senderAvatar,
  senderName,
  isPined,
  sendAt,
  files,
  type,
  data,
  meetingId,
  setMeetingId,

}) {
  const { width } = useWindowDimensions();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  function showUserInform() {
    setIsUserModalVisible(true);
  }

  function onPressReply() {
    navigation.navigate("ChatThreadChannel", {
      currentChannelId: currentChannelId,
      resetParentMessageRef: resetParentMessageRef,
      parentMessageId: id,
      parentContent: content,
      parentSendAt: sendAt,
      parentSenderId: senderId,
      parentSenderName: senderName,
      parentState: state,
      parentAvatar: senderAvatar,
      parentReactionCount: reactionCount,
      parentChildCount: childCount,
      parentIsPined: isPined,
      parentFiles: files,
    })
  }
  function RenderEmoji() {
    if (!reactionCount) return <></>;
    const emojis = Object.entries(reactionCount);
    return (
      <>
        {emojis.map((emoji, index) => {
          return (
            <View key={index} style={styles.emoji}>
              <Text>{emoji[0]} {emoji[1]}  </Text>
            </View>
          )
        })}
      </>
    )
  }
  function RenderFiles() {
    const openLink = (url) => {
      Linking.openURL(url);
    }
    const iconUri = {
      doc: "https://chat.zalo.me/assets/icon-word.d7db8ecee5824ba530a5b74c5dd69110.svg",
      pdf: "https://chat.zalo.me/assets/icon-pdf.53e522c77f7bb0de2eb682fe4a39acc3.svg",
      xls: "https://chat.zalo.me/assets/icon-excel.fe93010062660a8332b5f5c7bb2a43b1.svg",
      zip: "https://chat.zalo.me/assets/icon-zip.e1e9b9936e66e90d774fcb804f39167f.svg",
      default: "https://chat.zalo.me/assets/icon-file-empty.6796cfae2f36f6d44242f7af6104f2bb.svg",
    }

    const fileStyles = StyleSheet.create({
      container: {
        flexDirection: 'row', borderWidth: 0.5,
        borderRadius: 10, padding: 10,
        marginBottom: 10,
        alignItems: 'center',
      }
    })
    if (!files || files.length <= 0) return;

    return (
      <>
        {
          files.map((file, index) => {
            const typeFile = file.name.split(".")[1]
              ? file.name.split(".").pop().slice(0, 3).toUpperCase()
              : "";
            if (typeFile == "IMG" || typeFile == "PNG" || typeFile == "JPE" || typeFile == "JPG") {
              return (
                <TouchableOpacity key={index} onPress={() => openLink(file.url)} style={{ marginBottom: 10 }}>
                  <Image source={{ uri: file.url }} style={{ width: 150, height: 150 }} />
                </TouchableOpacity>
              )
            }
            if (typeFile == "DOC") {
              return (
                <TouchableOpacity
                  key={index}
                  style={fileStyles.container}
                  onPress={() => openLink(file.url)}
                >
                  <SvgUri uri={iconUri.doc} width="35" height="35" />
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              )
            }
            if (typeFile == "XLS") {
              return (
                <TouchableOpacity key={index}
                  style={fileStyles.container}
                  onPress={() => openLink(file.url)}
                >
                  <SvgUri uri={iconUri.xls} width="35" height="35" />
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              )

            }
            if (typeFile == "PDF") {
              return (
                <TouchableOpacity key={index}
                  style={fileStyles.container}
                  onPress={() => openLink(file.url)}
                >
                  <SvgUri uri={iconUri.pdf} width="35" height="35" />
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              )

            }
            if (typeFile == "ZIP" || typeFile == "RAR") {
              return (
                <TouchableOpacity key={index}
                  style={fileStyles.container}
                  onPress={() => openLink(file.url)}
                >
                  <SvgUri uri={iconUri.zip} width="35" height="35" />
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              )

            }
            if (file.url) {
              return (
                <TouchableOpacity key={index}
                  style={fileStyles.container}
                  onPress={() => openLink(file.url)}
                >
                  <SvgUri uri={iconUri.default} width="35" height="35" />
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              )
            }
          })
        }
      </>
    )

  }

  // preview links
  let detechLinks = []
  try {
    detechLinks = linkify.find(content);
  } catch {
    detechLinks = [];
  }
  function RenderPreview() {
    if (!detechLinks || detechLinks.length <= 0) return <></>;
    return (
      <>
        {detechLinks.map((link, index) => {
          return (
            <LinkPreview
              key={index}
              containerStyle={{ backgroundColor: '#EAEAEA', borderRadius: 10, margin: 5 }}
              text={link.href}
              renderText={() => (<Text>{truncString(link.value)}</Text>)}
            />
          )
        })}
      </>
    )
  }

  useEffect(function () {
    try {
      let jsonMeetingData = JSON.parse(data);
      if (typeof jsonMeetingData == "string") jsonMeetingData = JSON.parse(data);
      setMeetingId(jsonMeetingData.Id);
    } catch {

    }
  }, [data])

  function RenderMeetingHeader() {
    try {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <View style={{ padding: 7, backgroundColor: 'green', borderRadius: 10 }}>
            <Icon name="video-outline" size={25} color="white" />
          </View>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.usernameText}>A meeting has been created</Text>
            </View>
            <Text style={styles.timeText}>{getShortDatetimeSendAt(sendAt)}</Text>
          </View>
          {isPined ? (<Icon name="pin" size={18}
            color={"#A79E00"} style={{ marginLeft: 10, transform: [{ rotateZ: '30deg' }] }}
          />
          ) : <></>}
        </View>
      )
    } catch {
      return <></>;

    }
  }

  async function joinMeeting() {

  }

  function showMeetingInfo() {
    try {
      setIsMeetingInfoVisible(true);
    } catch {

    }

  }

  if (type == "2") {
    return (
      <View style={{ alignSelf: 'center', marginBottom: 10 }}>
        <Text style={{ fontStyle: 'italic' }}> {content}</Text>
      </View>
    );
  }

  return (
    <>
      {state == "deleted" ? (
        <View style={styles.containerDelete}>
          <Text style={styles.deleteMessage}>Message is Deleted</Text>
        </View>) : (
        <TouchableOpacity
          style={styles.messageContainer}
          delayLongPress={200}
          onPress={onPressReply}
          onLongPress={() => {
            selectedUserRef.current = senderId;
            setModalId(id);
            setModalVisible({
              message: true,
              emoji: false,
            })
          }
          }
        >
          {type == 1 ? (
            <RenderMeetingHeader />
          ) : (

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity onPress={showUserInform}>
                <Avatar.Image
                  size={40}
                  source={{
                    uri: senderAvatar,
                  }}
                />
              </TouchableOpacity>
              <View>
                {state != "" && state != "deleted" ? <Text style={styles.isSending}>{state}</Text> : <></>}
                <Text style={styles.usernameText}>{senderName}</Text>
                <Text style={styles.timeText}>{getShortDatetimeSendAt(sendAt)}</Text>
              </View>
              {isPined ? (<Icon name="pin" size={18}
                color={"#A79E00"} style={{ marginLeft: 10, transform: [{ rotateZ: '30deg' }] }}
              />
              ) : <></>}
            </View>
          )}
          <RenderHtml contentWidth={width} source={{ html: content ? content : "" }} />
          <RenderFiles />
          <RenderPreview />
          <View style={styles.emojiContainer}>
            <View style={styles.emoji}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setModalId(id);
                  setModalVisible({
                    message: false,
                    emoji: true,
                  })
                }
                }
              >
                <Image source={require('../../../assets/addemoji.png')} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </View>
            <RenderEmoji />
          </View>
          {childCount > 0 ? (
            <TouchableOpacity style={styles.replyContainer} onPress={onPressReply}>
              <Text style={styles.childCount}>{childCount} replies</Text>
              <Icon name="arrow-right-thin" size={23} color="#2463B8" style={{ marginLeft: 8 }}></Icon>
            </TouchableOpacity>
          ) : <></>}
        </TouchableOpacity>
      )}
      <UserInformationModal
        navigation={navigation}
        isUserModalVisible={isUserModalVisible}
        setIsUserModalVisible={setIsUserModalVisible}
        userId={senderId}
        isChannel={true}
      />
    </>

  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 25,
    alignSelf: "flex-start",
    borderRadius: 5,
    width: '100%',
  },
  containerDelete: {
    padding: 13,
    height: 50,
  },
  emojiContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emoji: {
    alignSelf: "flex-start",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    padding: 3,
    backgroundColor: "#E3E5E7",
  },
  replyContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3E5E7',
    borderRadius: 10,
    padding: 4,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
  },
  usernameText: { marginLeft: 20, fontWeight: "bold", fontSize: 15 },
  deleteMessage: { fontStyle: "italic" },
  isSending: { marginLeft: 20, fontSize: 15 },
  timeText: { marginLeft: 20, fontSize: 12 },
  childCount: { color: '#2463B8', fontWeight: '600', fontSize: 13 }
});
