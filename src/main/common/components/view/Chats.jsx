import React, {useEffect, useState} from 'react';
import ChatRoomList from '../chat/ChatRoomList';
import ChatRoom from '../chat/ChatRoom';
import './Chat.scss';
import ChatForm from "../chat/ChatForm";
import socketManager from '../../service/SocketManager';
import {get, host} from '../../service/RestService';
import moment from 'moment';
import {MessageType} from '../../types';

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

  const onSocketMessage = (payload) => {
    if(!selectedChat) {
      let chat = chatEvents.find((c) => c.id === payload.roomId);
      if(chat) {
        chat.messages.push(payload.chatMessage);
        setSelectedChat(chat);
      }
    } else {
      if(selectedChat.id !== payload.id) {
        console.log('\n\n\nRECEIVED UNRELATED CHAT');
      }
    }
  };

  const loadChats = () => {
    get(`${host}/api/v1/chat/fetchChats`, (response) => {
      setChatEvents(response);

      console.log('PROPS: ', props.selected);

      if (props.selected && props.selected.chatId) {
        const eventSelected = response.find(chat => chat.id === props.selected.chatId);
        setSelectedChat(eventSelected);
      }

      setLoading(false);
    }, (e) => {
    })
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
  });

  useEffect(() => {
    loadChats();
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHAT_MESSAGE);
  }, []);

  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const onChatRoomMessage = (message, chat) => {
    chat.updatedAt = moment().format();

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
          <div className="chat__rooms w-100">
            <div style={{width: "30%", borderRight: '1px solid #e1e1e1'}}>
              <ChatRoomList chatEvents={chatEvents} addedChat={newChat} selectionHandler={(selected) => {
                setSelectedChat(selected);
              }} addHandler={() => setMode('FORM')}/>
            </div>
            <div style={{width: "70%"}}>
              {
                selectedChat && <ChatRoom onMessage={(message, chat) => onChatRoomMessage(message, chat)}
                                          selectedChat={selectedChat}
                />
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
