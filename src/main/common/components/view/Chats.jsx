import React, {useState} from 'react';
import ChatRoomList from '../chat/ChatRoomList';
import ChatRoom from '../chat/ChatRoom';
import './Chat.scss';
import ChatForm from "../chat/ChatForm";

const Chats = (props) => {
  const [selectedMeeting, setSelectedMeeting] = useState(props.selectedMeeting);
  const [newChat, setNewChat] = useState(null);
  const [mode, setMode] = useState('LIST');

  return (
    <div className="chat">
      {
        mode === 'LIST' ?
          <div className="chat__rooms w-100">
            <div style={{width: "30%", borderRight: '1px solid #e1e1e1'}}>
              <ChatRoomList addedChat={newChat} selectionHandler={(selected) => {
                setSelectedMeeting(selected);
              }} addHandler={() => setMode('FORM')}/>
            </div>
            <div style={{width: "70%"}}>
              <ChatRoom selectedMeeting={selectedMeeting}/>
            </div>
          </div>
          :
          <div className={'w-100 h-100'}>
            <ChatForm addHandler={(chat) => {
              setSelectedMeeting(chat);
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
