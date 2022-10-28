import React from 'react';
import ChatRoomItem from './ChatRoomItem';
import './ChatRooms.scss';
import { IconButton } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import socketManager from '../../service/SocketManager';

const ChatRooms = () => {
  return (
    <div className="chatrooms">
      <div className="chatrooms__header">
        <div className="header__left">
          <h5>Chat</h5>
        </div>
        <div className="header__right">
          <Tooltip title="New Chat">
            <IconButton onClick={() => {}}>
              <img
                src="https://img.icons8.com/fluent-systems-regular/48/000000/edit-chat-history.png"
                alt="new chat"
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="chatrooms__rooms">
        {socketManager.chatEvents
          .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
          .map((event) => {
            return <ChatRoomItem key={event.id} event={event} />;
          })}
      </div>
    </div>
  );
};

export default ChatRooms;
