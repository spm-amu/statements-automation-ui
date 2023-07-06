import React, {useEffect, useState} from 'react';
import "./PersonCard.css"
import Icon from "./Icon";
import IconButton from "@material-ui/core/IconButton";
import socketManager from "../../common/service/SocketManager";
import {MessageType} from "../types";
import appManager from "../service/AppManager";
import Utils from '../Utils';

const PersonCardComponent = (props) => {
  const socketEventHandler = useState({});

  const handler = () => {
    return {
      get id() {
        return 'person-card-' + props.data.userId + '-' + props.inCall;
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
          case MessageType.SYSTEM_EVENT:
            onSystemEvent(be.payload);
            break;
        }
      }
    }
  };

  const [online, setOnline] = useState(false);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    setOnline(socketManager.isUserOnline(props.data));
  }, [props.data]);

  useEffect(() => {
    socketManager.removeSubscriptions(socketEventHandler);
    socketManager.addSubscriptions(socketEventHandler, MessageType.USER_ONLINE, MessageType.USERS_ONLINE, MessageType.USER_OFFLINE, MessageType.CALL_ENDED, MessageType.SYSTEM_EVENT)
  }, []);

  useEffect(() => {
    return () => {
      setCalling(false);
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const onSystemEvent = (payload) => {
    if (payload.systemEventType === MessageType.REQUEST_TO_JOIN_MEETING_ANSWERED) {
      setCalling(false);

      if (!Utils.isNull(props.onClosePeopleDialogHandler)) {
        props.onClosePeopleDialogHandler();
      }
    }
  };

  return (
    <div className="person-card">
      <div className="row no-margin" style={{paddingBottom: '8px', minHeight: '92px'}}>
        <table>
          <tr>
            <td>
              <div className={props.avatarSize === 'S' ? 'avatar-small' : null} style={{width: '54px'}}>
                <img
                  src={props.data.avatar ? props.data.avatar : require('../../desktop/dashboard/images/noimage-person.png')}
                  alt={""} style={{borderRadius: '50%'}}/>
              </div>
            </td>
            <td>
              <div className={"user-details"}>
                {
                  props.data.name
                }
              </div>
            </td>
          </tr>
        </table>
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
          (!appManager.get('CURRENT_MEETING') || props.inCall) && props.dialEnabled &&
          <div style={{marginRight: '4px'}} className={'buttons'}>
            {
              calling && props.inCall ?
                <>
                  <div className={'centered-flex-box blink-me'} style={{ marginRight: '4px', color: 'green' }}>
                    Calling...
                  </div>
                  <IconButton
                    onClick={(e) => {
                      setCalling(false);
                      props.onAudioCallCancelHandler(props.data)
                    }}
                    style={{
                      marginRight: '4px',
                      color: '#eb3f21',
                    }}
                  >
                    <Icon id={'CALL_END'}/>
                  </IconButton>
                </>
                :
                <IconButton
                  onClick={(e) => {
                    setCalling(true);
                    props.onAudioCallHandler(props.data)
                  }}
                  disabled={!online}
                  style={{
                    marginRight: '4px',
                    color: online ? 'green' : '',
                  }}
                >
                  <Icon id={'CALL_END'}/>
                </IconButton>
            }
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
};

const PersonCard = (props) => {
  return (
    <PersonCardComponent
      ref={ref}
      {...props}
    >
    </PersonCardComponent>
  );
};

export default PersonCard;
