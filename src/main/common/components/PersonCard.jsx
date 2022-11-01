import React, {useEffect, useState} from 'react';
import "./PersonCard.css"
import Icon from "./Icon";
import IconButton from "@material-ui/core/IconButton";
import socketManager from "../../common/service/SocketManager";
import {MessageType} from "../types";
import {useNavigate} from 'react-router-dom';

const PersonCardComponent = React.memo(React.forwardRef((props, ref) => {

  const navigate = useNavigate();

  const handler = () => {
    return {
      get id() {
        return 'person-card-' + props.data.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.USERS_ONLINE:
            setOnline(socketManager.isUserOnline(props.data));
            break;
          case MessageType.USER_ONLINE:
            if (be.payload.userId === props.data.userId) {
              setOnline(true);
            }
            break;
          case MessageType.USER_OFFLINE:
            if (be.payload.userId === props.data.userId) {
              setOnline(false);
            }

            break;
        }
      }
    }
  };

  const [online, setOnline] = useState(false);
  const socketEventHandler = useState({
    api: handler()
  });

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    setOnline(socketManager.isUserOnline(props.data));
    socketManager.addSubscriptions(socketEventHandler, MessageType.USER_ONLINE, MessageType.USERS_ONLINE, MessageType.USER_OFFLINE)
  }, []);

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  return (
    <div className="person-card">
      <div className="row no-margin" style={{borderBottom: '1px solid #e1e1e1', paddingBottom: '8px'}}>
        <div className={props.avatarSize === 'S' ? 'avatar-small' : null}>
          <img
            src={props.data.avatar ? props.data.avatar : require('../../desktop/dashboard/images/noimage-person.png')}
            alt={""} style={{borderRadius: '50%'}}/>
        </div>
        <div className={"user-details"}>
          {
            props.data.name
          }
        </div>
      </div>
      <div className={"bottom-strip row no-margin"}>
        <div className={'indicator col'}>
          {
            props.showOnlineIndicator &&
            <div className={online ? 'online' : 'offline'}>
            </div>
          }
        </div>
        {
          props.dialEnabled &&
          <div style={{marginRight: '4px'}} className={'buttons'}>
            <IconButton
              onClick={(e) => {
                props.onAudioCallHandler(props.data)
              }}
              disabled={!online}
              style={{
                marginRight: '4px'
              }}
            >
              <Icon id={'CALL_END'}/>
            </IconButton>
          </div>
        }
        {
          props.dialEnabled &&
          <div className={'col-*-*'}>
            <IconButton
              onClick={(e) => {

              }}
              disabled={online}
              style={{
                marginRight: '4px'
              }}
            >
              <Icon id={'CAMERA'}/>
            </IconButton>
          </div>
        }
        {
          props.chatEnabled &&
          <div className={'col-*-*'}>
            <IconButton
              onClick={(e) => {

              }}
              disabled={online}
              style={{
                marginRight: '4px'
              }}
            >
              <Icon id={'CHAT_BUBBLE'}/>
            </IconButton>
          </div>
        }
      </div>
    </div>
  );
}));

const PersonCard = React.memo(React.forwardRef((props, ref) => {
  return (
    <PersonCardComponent
      ref={ref}
      {...props}
    >
    </PersonCardComponent>
  );
}));

export default PersonCard;
