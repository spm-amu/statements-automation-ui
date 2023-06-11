/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import './Toolbar.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';
import {ListItemIcon, Menu, MenuItem} from '@material-ui/core';
import {Note, PersonAdd} from '@material-ui/icons';
import LottieIcon from '../LottieIcon';
import {MessageType} from "../../types";
import socketManager from "../../service/SocketManager";

const Toolbar = (props) => {
  const [numberOfHandsRaised, setNumberOfHandsRaised] = useState(0);
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [isRecording, setIsRecording] = useState(false);
  const [autoPermit, setAutoPermit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreActions = Boolean(anchorEl);
  const [screenShared, setScreenShared] = useState(false);
  const [step, setStep] = useState();

  const handler = () => {
    return {
      get id() {
        return 'meeting-toolbar';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.RAISE_HAND:
            onRaiseHand(be.payload);
            break;
          case MessageType.LOWER_HAND:
            onLowerHand(be.payload);
            break;
        }
      }
    }
  };

  const {
    participants,
    hasUnreadChats,
    hasUnseenWhiteboardEvent,
    whiteBoardShown,
    displayState,
    eventHandler,
    handRaised,
    isHost,
    someoneSharing,
    videoDisabled
  } = props;

  useEffect(() => {
    setScreenShared(props.screenShared);
  }, [props.screenShared]);

  const onRaiseHand = (payload) => {
    setNumberOfHandsRaised(numberOfHandsRaised + 1);
  };

  const onLowerHand = (payload) => {
    setNumberOfHandsRaised(numberOfHandsRaised - 1);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const muteVideo = () => {
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const toggleRecorder = () => {
    if (isRecording) {
      eventHandler.stopRecording();
    } else {
      eventHandler.recordMeeting()
    }

    setIsRecording(!isRecording);
  };

  useEffect(() => {
    setStep(props.step);
  }, [props.step]);

  useEffect(() => {
    setAutoPermit(props.autoPermit);
  }, [props.autoPermit]);

  useEffect(() => {
    eventHandler.onMuteVideo(videoMuted);
  }, [videoMuted]);

  useEffect(() => {
    setVideoMuted(props.videoMuted);
  }, [props.videoMuted]);

  useEffect(() => {
    setAudioMuted(props.audioMuted);
  }, [props.audioMuted]);

  useEffect(() => {
    eventHandler.onMuteAudio(audioMuted);
  }, [audioMuted]);

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);
    return () => {
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const muteAudio = () => {
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const shareScreen = () => {
    eventHandler.shareScreen();
    //setScreenShared(true);
  };

  const stopShareScreen = () => {
    eventHandler.stopShareScreen();
    //setScreenShared(false);
  };

  const endCall = () => {
    eventHandler.endCall();
  };

  const showPeople = () => {
    eventHandler.showPeople()
  };

  const showWhiteboard = () => {
    eventHandler.showWhiteboard()
  };

  const showChat = () => {
    eventHandler.showChat()
  };

  const raiseHand = () => {
    eventHandler.raiseHand()
  };

  const lowerHand = () => {
    eventHandler.lowerHand()
  };

  const closeWindow = () => {
    eventHandler.closeWindow()
  };

  const toggleAutoPermit = () => {
    setAutoPermit(prevAutoPermit => !prevAutoPermit);
    eventHandler.toggleAutoPermit()
  };

  return (
    <div className={'footer-toolbar'}>
      {
        step === 'SESSION_ENDED' ?
          <div className={'row centered-flex-box'}>
            <Tooltip title="Close">
              <IconButton
                onClick={() => {
                  closeWindow();
                }}
                style={{
                  backgroundColor: '#eb3f21',
                  color: 'white',
                  marginRight: '4px'
                }}
              >
                <Icon id={'CLOSE'}/>
              </IconButton>
            </Tooltip>
          </div>
          :
          <div className={'row centered-flex-box'}>
            {
              isHost && step === 'SESSION' &&
              <Tooltip title="Record">
                <IconButton
                  onClick={() => {
                    toggleRecorder();
                  }}
                  style={{
                    backgroundColor: isRecording ? 'white' : '#404239',
                    color: 'white',
                    marginRight: '4px'
                  }}
                >
                  {
                    isRecording ? <LottieIcon id={'recording'}/> : <Icon id={'RECORD'}/>
                  }
                </IconButton>
              </Tooltip>
            }
            {
              step === 'SESSION' && !videoDisabled &&
              <Tooltip title="Video">
                <IconButton
                  onClick={() => {
                    muteVideo();
                  }}
                  style={{
                    backgroundColor: videoMuted ? "#eb3f21" : "#404239",
                    color: 'white',
                    marginRight: '4px'
                  }}
                >
                  {videoMuted ? (
                    <Icon id={'VIDEOCAM_OFF'}/>
                  ) : (
                    <Icon id={'VIDEOCAM'}/>
                  )}
                </IconButton>
              </Tooltip>
            }
            {
              step === 'SESSION' &&
              <Tooltip title="Audio">
                <IconButton
                  onClick={() => {
                    muteAudio();
                  }}
                  style={{
                    backgroundColor: audioMuted ? "#eb3f21" : "#404239",
                    color: 'white',
                    marginRight: '4px'
                  }}
                >
                  {audioMuted ? (
                    <Icon id={'MIC_OFF'}/>
                  ) : (
                    <Icon id={'MIC'}/>
                  )}
                </IconButton>
              </Tooltip>
            }
            {" "}
            {
              step === 'SESSION' && displayState === 'MAXIMIZED' && !whiteBoardShown && (!someoneSharing || screenShared) &&
              <Tooltip title="Share">
                <IconButton
                  onClick={() => {
                    if (screenShared) {
                      stopShareScreen();
                    } else {
                      shareScreen();
                    }
                  }}
                  style={{
                    backgroundColor: screenShared ? '#8eb2f5' : '#404239',
                    color: 'white',
                    marginRight: '4px'
                  }}
                >
                  {screenShared ? (
                    <Icon id={'CANCEL_PRESENTATION'}/>
                  ) : (
                    <Icon id={'PRESENT_TO_ALL'}/>
                  )}
                </IconButton>
              </Tooltip>
            }
            {
              step === 'SESSION' && displayState === 'MAXIMIZED' &&
              <div>
                {
                  hasUnreadChats &&
                  <div className={'unread-dot'}/>
                }
                <Tooltip title="Chat">
                  <IconButton
                    style={{
                      backgroundColor: '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                    onClick={(e) => showChat()}
                  >
                    <Icon id={'CHAT_BUBBLE'}/>
                  </IconButton>
                </Tooltip>
              </div>
            }
            <Tooltip title="Call">
              <IconButton
                onClick={endCall}
                style={{
                  backgroundColor: '#eb3f21',
                  color: 'white',
                  marginRight: '4px'
                }}
              >
                <Icon id={'CALL_END'}/>
              </IconButton>
            </Tooltip>
            {
              step === 'SESSION' && displayState === 'MAXIMIZED' &&
              <div>
                {
                  <div className={'people-count-bubble'}>{participants.length}</div>
                }
                <Tooltip title="People">
                  <IconButton
                    onClick={(e) => showPeople()}
                    style={{
                      backgroundColor: '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'PEOPLE'}/>
                  </IconButton>
                </Tooltip>
              </div>
            }
            {
              step === 'SESSION' &&
              <div>
                {
                  numberOfHandsRaised > 0 &&
                  <div className={'people-count-bubble'}>{numberOfHandsRaised}</div>
                }
                <Tooltip title="Raise hand">
                  <IconButton
                    onClick={(e) => {
                      if (handRaised) {
                        lowerHand();
                      } else {
                        raiseHand();
                      }
                    }}
                    style={{
                      backgroundColor: '#404239',
                      color: handRaised ? '#e2b030' : 'white',
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'PAN_TOOL'}/>
                  </IconButton>
                </Tooltip>
              </div>
            }
            {
              step === 'SESSION' &&
              <div>
                {
                  hasUnseenWhiteboardEvent &&
                  <div className={'unread-dot'}/>
                }
                <Tooltip title="More Actions">
                  <IconButton
                    onClick={handleClick}
                    sx={{ml: 2}}
                    aria-controls={openMoreActions ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMoreActions ? 'true' : undefined}
                    style={{
                      backgroundColor: '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'MORE'}/>
                  </IconButton>
                </Tooltip>
              </div>
            }
          </div>
      }

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
              border: '1px solid red',
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
        transformOrigin={{horizontal: 20, vertical: 136}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem disabled={!isHost} onClick={toggleAutoPermit}>
          <ListItemIcon>
            <PersonAdd fontSize="small"/>
          </ListItemIcon>
          {
            autoPermit ? 'Do not auto permit' : 'Auto permit'
          }
        </MenuItem>
        {
          !screenShared &&
          <MenuItem
            onClick={showWhiteboard}
          >
            <ListItemIcon>
              <Note fontSize="small"/>
            </ListItemIcon>
            Whiteboard
          </MenuItem>
        }
      </Menu>
    </div>
  );
};

export default Toolbar;
