import React, { useEffect, useState } from 'react';
import ChatRoomList from '../chat/ChatRoomList';
import ChatRoom from '../chat/ChatRoom';
import './Chat.scss';
import ChatForm from "../chat/ChatForm";
import socketManager from '../../service/SocketManager';
import { get, host } from '../../service/RestService';
import Utils from '../../Utils';
import moment from 'moment';
import { MessageType } from '../../types';

const Chats = (props) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newChat, setNewChat] = useState(null);
  const [chatEvents, setChatEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('LIST');
  const [socketEventHandler] = useState({});

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'chats-122991829';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHAT_MESSAGE:
            onMessage(be.payload);
            break;
        }
      }
    }
  };

  const loadChats = () => {
    get(`${host}/api/v1/chat/fetchChats`, (response) => {
      setChatEvents(response);
      setLoading(false);
    }, (e) => {
    })
  };

  useEffect(() => {
    loadChats();
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHAT_MESSAGE);
  }, []);


  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
  });

  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const onMessage = (message) => {
    let updatedChatEvent = chatEvents.find(chat => chat.id === selectedChat.id);
    updatedChatEvent.updatedAt = moment().format();

    if (message.chatMessage) {
      updatedChatEvent.messages.push(message.chatMessage);
    } else {
      updatedChatEvent.messages.push(message);
    }

    setSelectedChat(updatedChatEvent);

    const sorted = chatEvents
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    setChatEvents([].concat(sorted))
  }

  return (
    !loading &&
    <div className="chat">
      {
        mode === 'LIST' ?
          <div className="chat__rooms w-100">
            <div style={{width: "30%", borderRight: '1px solid #e1e1e1'}}>
              <ChatRoomList chatEvents={chatEvents} addedChat={newChat} selectionHandler={(selected) => {
                console.log('props.selectedMeeting: ', selected);
                setSelectedChat(selected);
              }} addHandler={() => setMode('FORM')}/>
            </div>
            <div style={{width: "70%"}}>
              {
                selectedChat && <ChatRoom onMassageHandler={onMessage} selectedChat={selectedChat}/>
              }
            </div>
          </div>
          :
          <div className={'w-100 h-100'}>
            <ChatForm addHandler={(chat) => {
              setSelectedChat(chat);
              setMode('LIST');
              setNewChat(chat);
            }
            }>
            </ChatForm>
          </div>
      }
    </div>
  )
};

export default Chats;
