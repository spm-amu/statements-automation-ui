import React, {useEffect, useState} from 'react';
import './Activity.css';
import socketManager from '../../service/SocketManager';
import {get, host} from '../../service/RestService';
import {MessageType} from '../../types';

const Activity = (props) => {
  const [socketEventHandler] = useState({});
  const [loading, setLoading] = useState(true);

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

  const loadActivity = () => {
    get(`${host}/api/v1/activity/fetch`, (response) => {
      setLoading(false);
    }, (e) => {
    })
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
  });

  useEffect(() => {
    loadActivity();
    socketManager.addSubscriptions(socketEventHandler, MessageType.SYSTEM_ACTIVITY);
  }, []);

  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  return (
    !loading &&
    <div className="activity">
      ACTIVITY
    </div>
  )
};

export default Activity;
