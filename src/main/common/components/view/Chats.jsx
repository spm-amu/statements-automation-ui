import React, {useEffect, useState} from 'react';
import ChatRoomList from '../chat/ChatRoomList';
import ChatRoom from '../chat/ChatRoom';
import './Chat.scss';
import ChatForm from "../chat/ChatForm";
import socketManager from '../../service/SocketManager';
import { get, host, post } from '../../service/RestService';
import moment from 'moment';
import {MessageType, SystemEventType} from '../../types';
import { useLocation } from 'react-router-dom';
import appManager from '../../service/AppManager';

const Chats = (props) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newChat, setNewChat] = useState(null);
  const [chatEvents, setChatEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('LIST');
  const [socketEventHandler] = useState({});
  const [systemEventHandler] = useState({});

  const location = useLocation();

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'chats-111222';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHAT_MESSAGE:
            onSocketMessage(be.payload);
            break;
        }
      }
    }
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'chat-system-event-handler-api';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.ACTIVE_CHAT_CHANGED:
            let chat = updateSelectedChat(be.payload);
            onChatRoomMessage(be.payload.message, chat);
            break;
        }
      }
    }
  };

  function updateSelectedChat(payload) {
    let chat = chatEvents.find((c) => c.id === payload.roomId);
    if (chat) {
      chat.messages.push(payload.chatMessage);
      setSelectedChat(chat);
    }

    return chat;
  }

  const onSocketMessage = (payload) => {
    if(!selectedChat) {
      updateSelectedChat(payload);
    } else {
      if(selectedChat.id !== payload.id) {
        console.log('\n\n\nRECEIVED UNRELATED CHAT');
      }
    }
  };

  const createChatHandler = (title, chatParticipants) => {
    if (chatParticipants.length > 0) {
      let newChat = {
        participants: chatParticipants,
        title: title,
        type: 'DIRECT',
        messages: []
      };

      let userDetails = appManager.getUserDetails();

      newChat.participants.push({
        emailAddress: userDetails.emailAddress,
        name: userDetails.name,
        phoneNumber: userDetails.phoneNumber,
        userId: userDetails.userId
      });

      post(
        `${host}/api/v1/chat/create`,
        (response) => {
          setSelectedChat(newChat);
          setMode('LIST');
          loadChats();
        },
        (e) => {},
        newChat,
        null
      );
    }
  };

  const privateRoomChat = (filteredChatEvents, meetingRoomNav) => {
    let userDetails = appManager.getUserDetails();
    let existingChat = filteredChatEvents
      .find(chat => {
        if (chat.participants.length === 2) {
          let userParticipants = chat.participants.find(p => p.userId === userDetails.userId);
          let privateChatParticipants = chat.participants
            .find(p => p.userId === meetingRoomNav.privateChatUserId);

          if (userParticipants && privateChatParticipants) {
            return chat;
          }
        }

        return null;
      });

    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      get(`${host}/api/v1/auth/userInfo/${meetingRoomNav.privateChatUserId}`, (response) => {
        const addParticipants = [];
        addParticipants.push(response);
        createChatHandler(addParticipants);
      }, (e) => {
      })
    }
  };

  const loadChats = () => {
    get(`${host}/api/v1/chat/fetchChats`, (response) => {
      const filteredChatEvents = response.filter(chat => {
        if (chat.type === 'DIRECT') {
          return true;
        } else if (chat.type === 'CALENDAR_MEETING' && chat.status === 'ACTIVE' && chat.messages.length > 0) {
          return true;
        }

        return false;
      });

      filteredChatEvents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setChatEvents([].concat(filteredChatEvents));

      if (location.state && location.state.meetingRoom) {
        privateRoomChat(filteredChatEvents, location.state.meetingRoom);
      } else if (props.selected && props.selected.chatId) {
        const eventSelected = response.find(chat => chat.id === props.selected.chatId);
        setSelectedChat(eventSelected);
      } else if (filteredChatEvents && filteredChatEvents.length > 0) {
        setSelectedChat(filteredChatEvents[0]);
      }

      setLoading(false);
    }, (e) => {
    })
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    loadChats();
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHAT_MESSAGE);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.ACTIVE_CHAT_CHANGED);
  }, []);

  useEffect(() => {
    appManager.add('CURRENT_CHAT', selectedChat);
  }, [selectedChat]);

  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
      appManager.removeSubscriptions(systemEventHandler);
      appManager.add('CURRENT_CHAT', null);
    };
  }, []);

  const onChatRoomMessage = (message, chat) => {
    chat.updatedAt = moment().format();
    //chat.messages.push(message);

    setSelectedChat(chat);
    const sorted = chatEvents
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    setChatEvents([].concat(sorted))
  };

  return (
    !loading &&
    <div className="chat">
      {
        mode === 'LIST' ?
          <div className="chat__rooms w-100 h-100">
            <div style={{width: "30%", borderRight: '1px solid #e1e1e1'}} className="h-100">
              <ChatRoomList
                selectedChat={selectedChat}
                chatEvents={chatEvents}
                addedChat={newChat}
                selectionHandler={(selected) => {
                  setSelectedChat(selected);
                }}
                addHandler={() => setMode('FORM')}
              />
            </div>
            <div style={{width: "70%", height: '100%'}}>
              {
                selectedChat && <ChatRoom onMessage={(message, chat) => onChatRoomMessage(message, chat)}
                                          selectedChat={selectedChat} addedPeopleHandler={() => { loadChats(); }}
                />
              }
            </div>
          </div>
          :
          <div className={'w-100 h-100'}>
            <ChatForm addHandler={(title, newParticipants) => {
                createChatHandler(title, newParticipants);
              }
            } />
          </div>
      }
    </div>
  )
};

export default Chats;
