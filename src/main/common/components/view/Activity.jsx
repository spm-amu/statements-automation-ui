import React, {useEffect, useState} from 'react';
import './Activity.css';
import socketManager from '../../service/SocketManager';
import {MessageType} from '../../types';
import ActivityList from "../activity/ActivityList";

const Activity = (props) => {
  const [socketEventHandler] = useState({});
  const [selected, setSelected] = useState(null);

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
          setSelected(selected)
        }}/>
      </div>
      <div style={{width: '70%'}}>
        {
          selected &&
          <ActivityList rootEvent={selected}/>
        }
      </div>
    </div>
  )
};

export default Activity;
