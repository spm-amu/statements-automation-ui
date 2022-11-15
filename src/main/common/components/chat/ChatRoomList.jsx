import React, {useEffect, useState} from 'react';
import ChatRoomItem from './ChatRoomItem';
import './ChatRooms.scss';
import {IconButton} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import socketManager from '../../service/SocketManager';

const ChatRoomList = (props) => {

  const [chats, setChats] = useState([]);

  const updateChatList = (chat) => {
    socketManager.chatEvents.push(chat);
    setChats(chats.concat([chat]));
  };

  const addChat = () => {
    props.addHandler();
  };

  useEffect(() => {
    setChats(socketManager.chatEvents);
  }, []);

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
                src="https://img.icons8.com/fluent-systems-regular/48/000000/edit-chat-history.png"
                alt="new chat"
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="chatrooms__rooms">
        {chats
          .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
          .map((event, index) => {
            return <ChatRoomItem key={index} event={event} selectionHandler={props.selectionHandler}/>;
          })}
      </div>
    </div>
  );
};

export default ChatRoomList;
