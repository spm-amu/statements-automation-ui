import React, {useEffect, useState} from 'react';
import {MessageType} from "../../../common/types";
import socketManager from "../../../common/service/SocketManager";

const NotificationListener = (props) => {
  const [eventHandler] = useState({});
  const [count, setCount] = useState(0);

  const api = () => {
    return {
      get id() {
        return 'notification-listener';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.SYSTEM_ACTIVITY:
           setCount(count++);
            break;
        }
      }
    }
  };

  useEffect(() => {
    socketManager.addSubscriptions(eventHandler, MessageType.SYSTEM_ACTIVITY);
  }, []);

  useEffect(() => {
    eventHandler.api = api();
  });

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  return (
    count > 0 &&
    <div style={{
      backgroundColor: 'red',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      marginTop: '16px',
      top: '0',
      fontSize: '12px'
    }}>
      {
        count
      }
    </div>
  );
};

export default NotificationListener;
