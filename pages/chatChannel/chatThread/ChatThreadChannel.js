import { StatusBar, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRef, useState } from "react";
import { RichToolbar, RichEditor, actions } from "react-native-pell-rich-editor";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as signalR from "@microsoft/signalr";
import Message from "./Message";
import MessageModal from "./MessageModal";
import EmojiModal from "./EmojiModal";
import { ActivityIndicator, Divider } from "react-native-paper";
import getMessageChildChannelApi from "../../../api/chatApi/getMessageChildChannel.api";
import getUserByIdApi from "../../../api/userApi/getUserById.api";
import { messageState } from "../../../utils/messageState";
import { FlashList } from "@shopify/flash-list";
import { userSignedIn } from "../../../globalVar/global";
import { connectionChatChannel } from "../../../globalVar/global";
import * as DocumentPicker from 'expo-document-picker';
import uploadFilesApi from "../../../api/chatApi/uploadFiles.api";
import { getShorterFileName } from "../../../utils/common";

export default function ChatThreadChannel({ navigation, route }) {
  const
    {
      resetParentMessageRef,
      currentChannelId,
      parentMessageId,
      parentContent,
      parentSendAt,
      parentSenderId,
      parentSenderName,
      parentState,
      parentAvatar,
      parentReactionCount,
      parentChildCount,
      parentIsPined,
      parentFiles,
    } = route.params;
  const [messages, setMessages] = useState([]);
  const [sendDisabled, setSendDisabled] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState({
    message: false,
    emoji: false,
  });
  const [selectedMessageId, setSelectedMessageId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isSelectParentMessage, setIsSelectParentMessage] = useState(false);
  const [currentParentContent, setCurentParentContent] = useState(parentContent);
  const [currentParentState, setCurrentParentState] = useState(parentState);
  const [currentParentReactionCount, setCurrentParentReactionCount] = useState(parentReactionCount);
  const [currentParentChildCount, setCurrentParentChildCount] = useState(parentChildCount);
  const [currentParentIsPined, setCurrentParentIsPined] = useState(parentIsPined);
  const [currentParentFiles, setCurrentParentFiles] = useState(parentFiles);
  //   
  resetParentMessageRef.current.id = parentMessageId;
  resetParentMessageRef.current.content = currentParentContent;
  resetParentMessageRef.current.reactionCount = currentParentReactionCount;
  resetParentMessageRef.current.state = currentParentState;
  resetParentMessageRef.current.childCount = currentParentChildCount;
  //
  const richTextRef = useRef();
  const flatListRef = useRef();
  const selectedUserRef = useRef("");
  useEffect(function () {
    resetParentMessageRef.current.isChanging = false;
    async function getInitMessages() {
      let currentTime = (new Date()).toLocaleString();
      const messagesResponse = await getMessageChildChannelApi(currentTime, 7, parentMessageId, currentChannelId);
      const initMessages = [];
      messagesResponse.map(message => {
        message.state = message.isEdited ? messageState.isEdited : "";
        initMessages.push(message);
      })
      setMessages(initMessages);
    }
    getInitMessages();
  }, [])

  function receiveMessage() {
    connectionChatChannel.off("receive_message");
    connectionChatChannel.on("receive_message", function (message) {
      if (!message.isChannel) return;
      if (message.parentId != parentMessageId) return;
      const MessagesAfterReceived = [...messages];
      message.state = message.isEdited ? messageState.isEdited : "";
      MessagesAfterReceived.unshift(message);
      setMessages(MessagesAfterReceived);
      resetParentMessageRef.current.isChanging = true;
      setCurrentParentChildCount(currentParentChildCount + 1)
    })
  };
  function receiveDelete() {
    connectionChatChannel.off("delete_message");
    connectionChatChannel.on("delete_message", function (message) {
      if (!message.isChannel) return;
      if (message.receiverId != currentChannelId) return;
      const deleteMessage = messages.find(msg => msg.id == message.id);
      deleteMessage.state = messageState.isDeleted;
      setMessages([...messages]);
      resetParentMessageRef.current.isChanging = true;
      setCurrentParentChildCount(currentParentChildCount - 1);
    })
  }
  function reiceiveUpdate() {
    connectionChatChannel.off("update_message");
    connectionChatChannel.on("update_message", function (message) {
      if (!message.isChannel) return;
      if (message.receiverId != currentChannelId) return;
      if (message.id == parentMessageId) {
        setCurentParentContent(message.content);
        setCurrentParentReactionCount(message.reactionCount);
        setCurrentParentState(message.isEdited ? messageState.isEdited : "");
        setCurrentParentIsPined(message.isPined);
        setCurrentParentFiles(message.files);
      }
      if (message.id != parentMessageId) {
        const updateMessage = messages.find(msg => msg.id == message.id);
        updateMessage.content = message.content;
        updateMessage.reactionCount = message.reactionCount;
        updateMessage.isEdited = message.isEdited;
        updateMessage.isPined = message.isPined;
        updateMessage.files = message.files;
        updateMessage.state = updateMessage.isEdited ? messageState.isEdited : "";
        setMessages([...messages]);
      }
      resetParentMessageRef.current.isChanging = true;
    })
  }
  receiveMessage();
  reiceiveUpdate();
  receiveDelete();

  async function sendMessage() {
    if (isEdit == false) {
      setIsLoadingSend(true);
      let tempId = Date.now();
      let currentTime = new Date()
      let content = richTextRef.text;
      //  upload files
      let toUploadFiles = null;
      if (uploadFiles.length >= 0)
        toUploadFiles = await uploadFilesApi(uploadFiles);
      // 

      const messagesAfterSending = [...messages];
      messagesAfterSending.unshift(
        buildMessage({
          id: tempId,
          senderId: userSignedIn.id,
          content,
          senderAvatar: userSignedIn.picture,
          senderName: userSignedIn.firstName + " " + userSignedIn.lastName,
          sendAt: currentTime,
          state: messageState.isSending,
        })
      )
      // setMessages(messagesAfterSending);
      flatListRef.current.scrollToOffset({ offset: 0 });
      richTextRef.current.setContentHTML("");
      setUploadFiles([]);
      setSendDisabled(true);
      sendMessageToServer(content, messagesAfterSending, toUploadFiles);
    }
    if (isEdit == true && isSelectParentMessage == false) {
      updateMessageToServer();
    }
    if (isEdit == true && isSelectParentMessage == true) {
      updateParentMessageToServer();
    }
    setIsEdit(false);
  }
  async function sendMessageToServer(content, messagesAfterSending, toUploadFiles) {
    const response = await connectionChatChannel.invoke("SendMessageAsync", {
      ReceiverId: currentChannelId,
      ReplyTo: parentMessageId,
      Content: content,
      IsChannel: true,
      Files: toUploadFiles.length ? [...toUploadFiles.map(file => file.id)] : [],
    }).catch(function (err) {
      return console.error(err.toString());
    });
    if (response.length <= 0) {
      return;
    }
    const tempMessages = [...messagesAfterSending]
    tempMessages[0].id = response.id;
    tempMessages[0].state = "";
    tempMessages[0].files = response.files;
    // setMessages(tempMessages);
    setIsLoadingSend(false);
    resetParentMessageRef.current.isChanging = true;
    setCurrentParentChildCount(currentParentChildCount + 1);
  }
  async function updateMessageToServer() {
    const response = await connectionChatChannel.invoke("UpdateMessageAsync", {
      Id: selectedMessageId,
      Content: richTextRef.text,
      IsChannel: true,
    }).catch(function (err) {
      return console.error(err.toString());
    });
    richTextRef.current.setContentHTML("");
    setSendDisabled(true);
  }
  async function updateParentMessageToServer() {
    const response = await connectionChatChannel.invoke("UpdateMessageAsync", {
      Id: selectedMessageId,
      Content: richTextRef.text,
      IsChannel: true,
    }).catch(function (err) {
      return console.error(err.toString());
    });
    setCurentParentContent(richTextRef.text);
    setCurrentParentState(messageState.isEdited);
    setMessages([...messages]);
    richTextRef.current.setContentHTML("");
    setSendDisabled(true);
    resetParentMessageRef.current.isChanging = true;
  }

  function cancelEdit() {
    richTextRef.current.setContentHTML("");
    richTextRef.current.initialFocus = false;
    setSendDisabled(true);
    setIsEdit(false);
  }
  function onChangeTextMessage(text) {
    richTextRef.text = text;
    if (!text) {
      setSendDisabled(true);
      return;
    }
    setSendDisabled(false);
  }
  async function handleOnEndReached() {
    setLoadingMore(true);
    if (!messages || messages.length <= 0) {
      setLoadingMore(false);
      return;
    }
    const oldestMessage = messages[messages.length - 1];
    let oldestTime = new Date(oldestMessage.sendAt);
    oldestTime = oldestTime.toISOString();
    const response = await getMessageChildChannelApi(oldestTime, 5, parentMessageId, currentChannelId);

    const loadMoreMessage = [...messages];
    response.map(message => {
      message.state = message.isEdited ? messageState.isEdited : "";
      loadMoreMessage.push(message);
    }
    )
    setMessages(loadMoreMessage);
    // reach to oldest message in database
    if (response.length == 0) {
      setLoadingMore(false);
      return;
    }
  }

  // upload file
  const [uploadFiles, setUploadFiles] = useState([]);
  function RenderUploadImages() {
    if (!uploadFiles || uploadFiles.length <= 0) return <></>;
    return (
      <>
        {uploadFiles.map((file, index) => {
          return (
            <View key={index} style={{
              alignSelf: 'flex-start', position: 'relative', flexWrap: 'wrap',
              flexDirection: 'row', margin: 10, borderWidth: 0.5, padding: 3, borderRadius: 15
            }}>
              <Icon name="file" size={23}></Icon>
              <Text>{getShorterFileName(file.name)}</Text>
              <TouchableOpacity onPress={() => cancelUploadFile(file)}>
                <Icon name="close" size={20}></Icon>
              </TouchableOpacity>
            </View>
          )
        })}
      </>
    )
  }
  function cancelUploadFile(file) {
    let resetUploadfiles = uploadFiles;
    let cancelFileIndex = resetUploadfiles.findIndex(
      upLoadFile => file.uri == upLoadFile.uri && file.size == upLoadFile.size
    );
    resetUploadfiles.splice(cancelFileIndex, 1);
    setUploadFiles([...resetUploadfiles]);
    if (uploadFiles <= 0) setSendDisabled(true);

  }
  async function onUploadFile() {
    let result = await DocumentPicker.getDocumentAsync({
      multiple: true,
    });

    if (!result.canceled) {
      let newUploadFiles = uploadFiles;
      result.assets.map(asset => {
        newUploadFiles.push(asset);
      });
      setUploadFiles([...newUploadFiles]);
      if (uploadFiles.length > 0) setSendDisabled(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          marginTop: StatusBar.currentHeight,
          borderBottomWidth: 1,
          alignItems: "center",
          paddingLeft: 10,
          paddingRight: 12,
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={28} />
        </TouchableOpacity>
        {/* Parent Message  */}
        <Message
          navigation={navigation}
          isParent={true}
          setIsSelectParentMessage={setIsSelectParentMessage}
          senderId={parentSenderId}
          selectedUserRef={selectedUserRef}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setModalId={setSelectedMessageId}
          id={parentMessageId}
          content={currentParentContent}
          isPined={currentParentIsPined}
          senderAvatar={parentAvatar}
          senderName={parentSenderName}
          sendAt={parentSendAt}
          state={currentParentState}
          reactionCount={currentParentReactionCount}
          files={currentParentFiles}
        />
        <View
          style={{
            flexDirection: "row-reverse",
            flex: 1,
          }}
        >
        </View>
      </View>
      <View
        style={{
          flex: 40,
        }}
      >
        <FlashList
          ref={flatListRef}
          ListFooterComponent={() => loadingMore && <ActivityIndicator color="black" size={30} />}
          onEndReached={handleOnEndReached}
          onEndReachedThreshold={0.1}
          estimatedItemSize={200}
          inverted
          data={messages}
          renderItem={({ item }) => (
            <Message
              navigation={navigation}
              isParent={false}
              setIsSelectParentMessage={setIsSelectParentMessage}
              senderId={item.senderId}
              selectedUserRef={selectedUserRef}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              setModalId={setSelectedMessageId}
              reactionCount={item.reactionCount}
              isPined={item.isPined}
              id={item.id}
              content={item.content}
              senderAvatar={item.senderAvatar}
              senderName={item.senderName}
              sendAt={item.sendAt}
              state={item.state}
              files={item.files}
            />
          )}
        />
      </View>
      <MessageModal
        resetParentMessageRef={resetParentMessageRef}
        currentParentChildCount={currentParentChildCount}
        setCurrentParentChildCount={setCurrentParentChildCount}
        parentContent={currentParentContent}
        isSelectParentMessage={isSelectParentMessage}
        messages={messages}
        setMessages={setMessages}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        richTextRef={richTextRef}
        selectedUserRef={selectedUserRef}
        setIsEdit={setIsEdit}
        setSendDisabled={setSendDisabled}
        selectedMessageId={selectedMessageId}
      />
      <EmojiModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedMessageId={selectedMessageId}
        messages={messages}
        setMessages={setMessages}
      />

      {!uploadFiles || uploadFiles.length <= 0 ? <></> : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ marginLeft: 10, color: 'grey', fontStyle: 'italic' }}>Upload files</Text>
            <Divider style={{ flex: 1 }} bold />
          </View>
          <ScrollView style={{ maxHeight: 150 }}>
            <RenderUploadImages />
          </ScrollView>
        </>
      )}

      <ScrollView>
        <RichEditor
          editorStyle={{ backgroundColor: 'rgba(52, 52, 52, 0)' }}
          placeholder="Message"
          androidLayerType="software"
          style={{ borderTopWidth: 1, borderColor: 'grey' }}
          ref={richTextRef}
          onChange={onChangeTextMessage}
        />
      </ScrollView>
      <View style={{ flexDirection: 'row' }}>
        <RichToolbar
          editor={richTextRef}
          actions={[actions.setBold, actions.setItalic,
          actions.setUnderline, actions.insertBulletsList, actions.insertOrderedList]}
        />

        {!isEdit ? (
          <TouchableOpacity style={{ alignSelf: 'flex-start', padding: 10 }} onPress={onUploadFile}>
            <Icon name="link" size={23}></Icon>
          </TouchableOpacity>
        ) : <></>}

        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>

          {isLoadingSend ? (
            <ActivityIndicator color="black" style={{ marginRight: 15 }} />
          ) : (
            <TouchableOpacity
              style={{
                padding: 10, borderRadius: 20, marginRight: 15,
                alignSelf: 'flex-end', backgroundColor: sendDisabled ? "rgba(52, 52, 52, 0)" : "black"
              }}
              disabled={sendDisabled}
              onPress={sendMessage}>
              <Icon name="send" size={23} color={sendDisabled ? "grey" : "white"} />
            </TouchableOpacity>
          )}

          {isEdit ? (
            <TouchableOpacity
              style={{
                padding: 10, borderRadius: 20, marginRight: 15,
                alignSelf: 'flex-end', backgroundColor: "red"
              }}
              onPress={cancelEdit}>
              <Icon name="window-close" size={23} color={"white"} />
            </TouchableOpacity>

          ) : <></>}

        </View>
      </View>
    </View>
  );
}

function buildMessage({ id, reactionCount, isPined, isEdited, senderId, content, senderAvatar, senderName, sendAt, state = "" }) {
  return {
    id,
    reactionCount,
    senderId,
    isPined,
    isEdited,
    content,
    senderAvatar,
    senderName,
    sendAt,
    state,
  }
}
