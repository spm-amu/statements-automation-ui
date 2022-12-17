import React, {useEffect, useState} from 'react';
import './Activity.css';
import './Chat.scss';
import socketManager from '../../service/SocketManager';
import {MessageType} from '../../types';
import ActivityList from "../activity/ActivityList";
import ChatRoom from '../chat/ChatRoom';
import {get, host} from "../../service/RestService";

const Activity = (props) => {
  const [socketEventHandler] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'activity-1-1';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.SYSTEM_ACTIVITY:
            processActivity(be);
            break;
        }
      }
    }
  };

  const processActivity = (activity) => {
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
  });

  useEffect(() => {
    socketManager.addSubscriptions(socketEventHandler, MessageType.SYSTEM_ACTIVITY);
  }, []);


  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  return (
    <div className="activity row" style={{marginLeft: '0px', marginRight: '0px'}}>
      <div className={'col'} style={{
        borderRight: "1px solid #e1e1e1",
        paddingRight: '8px',
        paddingLeft: '8px'
      }}>
        <ActivityList selectionHandler={(selected) => {
          setSelectedChat(null);
          if (selected.data.chatId) {
            get(`${host}/api/v1/chat/fetch/${selected.data.chatId}`, (response) => {
              setSelectedChat(response);
              setSelected(selected);
            }, (e) => {

            })
          } else {
            setSelected(selected);
          }
        }}/>
      </div>
      <div style={{width: '70%'}}>
        {
          selected &&
          <div className="chat">
            {
              selectedChat ?
                <div className="chat__rooms w-100 h-100">
                  <ChatRoom selectedChat={selectedChat}/>
                </div>
                :
                <ActivityList rootEvent={selected}/>
            }
          </div>
        }
      </div>
    </div>
  )
};

export default Activity;
