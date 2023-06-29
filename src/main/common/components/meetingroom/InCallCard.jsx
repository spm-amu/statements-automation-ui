import React, {useEffect, useState} from 'react';
import './InCallCard.css';
import {IconButton, ListItemIcon, Menu, MenuItem} from '@material-ui/core';
import Icon from '../Icon';
import {PersonAdd} from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import {useNavigate} from 'react-router-dom';
import appManager from "../../service/AppManager";
import Utils from '../../Utils';
import {MessageType, SystemEventType} from "../../types";
import socketManager from "../../service/SocketManager";

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreActions = Boolean(anchorEl);
  const {participant} = props;
  const [handRaised, setHandRaised] = React.useState(participant.handRaised);
  const [inView, setInView] = React.useState(participant.inView);
  const [pinned, setPinned] = React.useState(participant.pinned);
  const [videoMuted, setVideoMuted] = React.useState(participant.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(participant.audioMuted);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const navigate = useNavigate();

  const handler = () => {
    return {
      get id() {
        return 'in-call-card-' + participant.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.RAISE_HAND:
            onRaiseHand(be.payload);
            break;
          case MessageType.LOWER_HAND:
            onLowerHand(be.payload);
            break;
          case MessageType.NEW_PRODUCERS:
            onNewProducers(be.payload);
            break;
        }
      }
    }
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'in-call-card-' + participant.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.PARTICIPANT_OFF_VIEW:
            handleParticipantOffView(be);
            break;
          case SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED:
            onAVSettingsChange(be);
            break;
        }
      }
    }
  };

  const onNewProducers = (producers) => {
    /*for (const producer of producers) {
      if (producer.userId === participant.userId) {
        if (producer.kind === 'video') {
          participant.videoProducers = producers;
        }
      }
    }*/
  };

  const onAVSettingsChange = (payload) => {
    if (payload.userId === participant.userId) {
      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);

      if(payload.videoMuted) {
        //participant.videoProducers = null;
      }
    }
  };

  const handleParticipantOffView = (payload) => {
    if (payload.userId === participant.userId) {
      setInView(false);
    }
  };

  const onRaiseHand = (payload) => {
    if (participant && payload && payload.userId === participant.userId) {
      setHandRaised(true);
    }
  };

  const onLowerHand = (payload) => {
    if (participant && payload && payload.userId === participant.userId) {
      setHandRaised(false);
    }
  };

  useEffect(() => {
    eventHandler.api = handler();
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND, MessageType.NEW_PRODUCERS);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.PARTICIPANT_OFF_VIEW, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);

    return () => {
      socketManager.removeSubscriptions(eventHandler);
      appManager.removeSubscriptions(systemEventHandler);
    };
  }, []);

  const privateChatHandler = () => {
    navigate("/view/chats", {
      state: {
        meetingRoom: {
          privateChatUserId: participant.userId
        }
      }
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const togglePinned = () => {
    let newPinnedVal = !pinned;
    setPinned(newPinnedVal);
    participant.pinned = newPinnedVal;
    if (props.onPinHandler) {
      props.onPinHandler(participant, newPinnedVal);
    }
  };

  const computeParticipantName = () => {
    let name = participant.name;

    if (Utils.isNull(participant.userId)) {
      name = `${name} (Guest)`;
    }

    return name;
  };

  return (
    <div
      className={'col person-card-wrapper'}
      style={{
        marginLeft: '0', paddingLeft: '0', paddingRight: '0', maxWidth: props.maxWidth ? props.maxWidth : '400px',
        borderBottom: props.borderBottom ? props.borderBottom : null
      }}
    >
      <div className="participant-card">
        <div className="row no-margin person-card">
          <div className={'col user-details'}>{computeParticipantName()}</div>
          <div style={{
            marginTop: '4px',
            marginLeft: '0',
            marginRight: '0',
            paddingLeft: '0',
            paddingRight: '0',
            textAlign: 'right'
          }}>
            <div>
              {
                appManager.getUserDetails().userId !== participant.userId && handRaised &&
                <IconButton
                  onClick={() => {
                  }}
                  size="small"
                  sx={{ml: 1}}
                  style={{color: '#e2b030'}}
                >
                  <Icon id={'PANTOOL'} fontSize={'small'}/>
                </IconButton>
              }
              {
                <span style={{marginLeft: '4px'}}>
                  {
                    props.isHost && !audioMuted ?
                      <IconButton
                        onClick={(e) => {
                          props.onHostAudioMute(participant)
                        }}
                        style={{
                          marginRight: '4px',
                          width: '16px',
                          height: '16px'
                        }}
                      >
                        <Icon id={'MIC'}/>
                      </IconButton>
                      :
                      <>
                        {audioMuted ? (
                          <Icon id={'MIC_OFF'}/>
                        ) : (
                          <Icon id={'MIC'}/>
                        )}
                      </>
                  }
                  {
                    props.isHost && !videoMuted &&
                    <IconButton
                      onClick={(e) => {
                        props.onHostVideoMute(participant)
                      }}
                      style={{
                        marginRight: '4px',
                        width: '16px',
                        height: '16px',
                        color: 'white'
                      }}
                    >
                      <Icon id={'CAMERA'} color='green'/>
                    </IconButton>
                  }
                  {
                    !props.isHost && !videoMuted &&
                    <Icon id={'CAMERA'} color='green'/>
                  }
                  {
                    videoMuted &&
                    <Icon id={'CAMERA_OFF'}/>
                  }
                </span>
              }
              {
                appManager.getUserDetails().userId !== participant.userId &&
                <IconButton
                  onClick={privateChatHandler}
                  size="small"
                  sx={{ml: 2}}
                >
                  <Icon id={'CHAT_BUBBLE'} fontSize={'small'} color={'white'}/>
                </IconButton>
              }
              {
                appManager.getUserDetails().userId !== participant.userId &&
                <Tooltip title="More Actions">
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ml: 2}}
                    aria-controls={openMoreActions ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMoreActions ? 'true' : undefined}
                  >
                    <Icon id={'MORE'} color={'white'}/>
                  </IconButton>
                </Tooltip>
              }
            </div>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openMoreActions}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiList-root': {
                  },
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'primary',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{horizontal: 20, vertical: 44}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              {
                props.isHost &&
                <MenuItem
                  disabled={Utils.isNull(participant.userId)}
                  onClick={() => props.onChangeMeetingHostHandler(participant)}
                >
                  <ListItemIcon>
                    <PersonAdd fontSize="small"/>
                  </ListItemIcon>
                  Change Meeting Host
                </MenuItem>

              }
              <MenuItem
                disabled={inView}
                onClick={() => {
                  setInView(true);
                  participant.inView = true;
                  appManager.fireEvent(SystemEventType.PARTICIPANT_IN_VIEW, participant)
                }}
              >
                <ListItemIcon>
                  <Icon id={'MAXIMIZE'}/>
                </ListItemIcon>
                Bring to view
              </MenuItem>
              {/*<MenuItem
                disabled={!props.onPinHandler}
                onClick={() => togglePinned()}
              >
                <ListItemIcon>
                  {
                    pinned ? <PinDrop fontSize="small"/> : <PersonPinCircle fontSize="small"/>
                  }
                </ListItemIcon>
                {
                  pinned ? 'Unpin' : "Pin"
                }
              </MenuItem>*/}
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InCall;
