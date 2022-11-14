import React from 'react';
import ChatRooms from '../chat/ChatRooms';
import ChatRoom from '../chat/ChatRoom';
import './Chat.scss';

const Chats = (props) => {
  const { selectedMeeting } = props;

  return (
    <div className="chat">
      <div className="chat__rooms">
        <ChatRooms />
        <div style={{ width: "70vw" }}>
          <ChatRoom selectedMeeting={selectedMeeting} {...props} />
        </div>
      </div>
    </div>
  )
};

export default Chats;
