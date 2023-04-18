import React, { useEffect, useState } from 'react';
import ChatRoomItem from './ChatRoomItem';
import './ChatRooms.scss';
import { IconButton } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import socketManager from '../../service/SocketManager';

const ChatRoomList = (props) => {

  const [chats, setChats] = useState([]);

  const updateChatList = (chat) => {
    setChats([...chats, chat]);
  };

  const addChat = () => {
    props.addHandler();
  };

  useEffect(() => {
    setChats([].concat(props.chatEvents));

    console.log('socketManager.unreadMessages: ', socketManager.unreadMessages);
  }, [props.chatEvents]);

  useEffect(() => {
    if(props.addedChat) {
      updateChatList(props.addedChat);
    }
  }, [props.addedChat]);

  return (
    <div className="chatrooms">
      <div className="chatrooms__header">
        <div className="header__left">
          <h5>Chat</h5>
        </div>
        <div className="header__right">
          <Tooltip title="New Chat">
            <IconButton onClick={() => {
              addChat();
            }}>
              <img
                src={require('/assets/edit-chat-history.png')}
                alt="new chat"
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="chatrooms__rooms">
        {chats
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .map((event, index) => {

            let newArr = [...event.messages];

            event.messages = newArr
              .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));

            return <ChatRoomItem selectedChat={props.selectedChat} key={index} event={event} selectionHandler={props.selectionHandler}/>;
          })}
      </div>
    </div>
  );
};

export default ChatRoomList;
