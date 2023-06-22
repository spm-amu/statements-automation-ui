import React, {Fragment, useEffect, useState} from 'react';

import '../../Calendar.css';
import './MeetingRoom.css';
import Footer from "../../../meetingroom/Footer";
import appManager from "../../../../service/AppManager";
import {MessageType, SystemEventType} from "../../../../types";
import peerManager from "../../../../service/simplepeer/PeerManager";
import socketManager from "../../../../service/SocketManager";

const Steps = {
  LOBBY: 'LOBBY',
  SESSION: 'SESSION',
  SESSION_ENDED: 'SESSION_ENDED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  STREAM_ERROR: 'STREAM_ERROR'
};

const hangUpAudio = new Audio(appManager.getSoundFileHost() + '/hangupsound.mp3');
const joinInAudio = new Audio(appManager.getSoundFileHost() + '/joinsound.mp3');
const permitAudio = new Audio(appManager.getSoundFileHost() + '/permission.mp3');

const {electron} = window;

const MeetingRoom = (props) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarTab, setSideBarTab] = useState('');
  const [displayState, setDisplayState] = useState(props.displayState);
  const [device, setDevice] = useState({});
  const [hasUnreadChats, setHasUnreadChats] = useState(null);
  const [hasUnseenWhiteboardEvent, setHasUnseenWhiteboardEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [videoDisabled, setVideoDisabled] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [screenShared, setScreenShared] = useState(null);
  const [someoneSharing, setSomeoneSharing] = useState(null);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [step, setStep] = useState('LOBBY');
  const [meetingParticipantGridMode, setMeetingParticipantGridMode] = useState('DEFAULT');
  const [activityMessage, setActivityMessage] = useState(null);
  const [autoPermit, setAutoPermit] = useState(false);
  const [meetingChat, setMeetingChat] = useState(null);
  const [meetingStarted, setMeetingStarted] = useState(null);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const [preErrorStep, setPreErrorStep] = useState('');
  const {
    selectedMeeting,
    userToCall,
    isDirectCall,
    isRequestToJoin,
    callerUser
  } = props;

  const handler = () => {
    return {
      get id() {
        return 'meeting-room-' + selectedMeeting.id;
      },
      get participants() {
        return participants;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.ALLOWED:
            join();
            break;
          case MessageType.PERMIT:
            addUserToLobby(be.payload);
            break;
          case MessageType.USER_JOINED:
            addUser(be.payload);
            break;
          case MessageType.USER_LEFT:
            removeUser(be.payload);
            break;
          case MessageType.CALL_ENDED:
            onCallEnded();
            break;
          case MessageType.AUDIO_VISUAL_SETTINGS_CHANGED:
            onAVSettingsChange(be.payload);
            break;
          case MessageType.MEETING_ENDED:
            onCallEnded();
            break;
          case MessageType.WHITEBOARD_EVENT:
            updateWhiteboardEvents(be.payload);
            appManager.fireEvent(SystemEventType.WHITEBOARD_EVENT_ARRIVED, be.payload);
            break;
          case MessageType.SYSTEM_EVENT:
            onSystemEvent(be.payload);
            break;
          case MessageType.CHANGE_HOST:
            onChangeHost(be);
            break;
          case MessageType.CHAT_MESSAGE:
            handleChatMessage(be.payload);
            break;
          case MessageType.SYSTEM_ALERT:
            onSystemAlert(be.payload);
            break;
        }
      }
    }
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'meeting-room-system-event-handler-api-' + selectedMeeting.id;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.SOCKET_CONNECT:
            if (preErrorStep) {
              setStep(preErrorStep);
            }

            if (preErrorStep === Steps.SESSION) {
              peerManager.clearUserToPeerMap();
              participants.splice(0, participants.length);
              console.log("RE-JOINING FROM SESSION AFTER CONNECT");
              join();
            }
            break;
          case SystemEventType.SOCKET_DISCONNECT:
            if (step !== Steps.SYSTEM_ERROR && step !== Steps.CONNECTION_ERROR) {
              setPreErrorStep(step);
            }

            setStep(Steps.CONNECTION_ERROR);
            break;
        }
      }
    }
  };

  /********************************** USE EFFECT **************************************/

  useEffect(() => {
    if (displayState) {
      setDisplayState(props.displayState);
    }
  }, [props.displayState]);

  useEffect(() => {
    setMeetingStarted(props.meetingStarted);
  }, [props.meetingStarted]);

  useEffect(() => {
    setAutoPermit(props.autoPermit);
  }, [props.autoPermit]);

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    socketManager.removeSubscriptions(eventHandler);
    appManager.removeSubscriptions(systemEventHandler);

    socketManager.addSubscriptions(eventHandler, MessageType.PERMIT, MessageType.ALLOWED, MessageType.USER_JOINED, MessageType.USER_LEFT,
      MessageType.ALL_USERS, MessageType.RECEIVING_RETURNED_SIGNAL, MessageType.CALL_ENDED,
      MessageType.AUDIO_VISUAL_SETTINGS_CHANGED, MessageType.MEETING_ENDED, MessageType.WHITEBOARD_EVENT, MessageType.WHITEBOARD,
      MessageType.CHANGE_HOST, MessageType.CHAT_MESSAGE, MessageType.SYSTEM_EVENT, MessageType.SYSTEM_ALERT);

    appManager.addSubscriptions(systemEventHandler, SystemEventType.SOCKET_CONNECT, SystemEventType.SOCKET_DISCONNECT, SystemEventType.PEER_DISCONNECT);
    return () => {
      if (isRecordingRef.current) {
        stopRecordingMeeting();
      }

      socketManager.removeSubscriptions(eventHandler);
      appManager.removeSubscriptions(systemEventHandler);
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
      appManager.remove('CURRENT_MEETING');
    };
  }, []);

  useEffect(() => {
    if (meetingChat) {
      setSideBarTab('Chat');
      setSideBarOpen(true);
      setHasUnreadChats(false);
    }
  }, [meetingChat]);

  /******************************** END USE EFFECT ************************************/

  const onSystemAlert = (payload) => {
    if (payload.type === 'MEETING_STARTED_ALERT') {
      handleMessageArrived({
        message: payload.message
      })
    }
  };

  const handleMessageArrived = (event) => {
    if (step === Steps.SESSION && event.message && event.message.length > 0) {
      setActivityMessage(event.message);
      const messageTimeout = setTimeout(() => {
        setActivityMessage(null);
        clearTimeout(messageTimeout);
      }, 4000)
    }
  };

  const join = () => {

  };

  const recordMeeting = () => {

  };

  const stopRecordingMeeting = () => {

  };

  const handleEndCall = () => {

  };

  const shareScreen = () => {

  };

  const stopShareScreen = () => {

  };

  const fetchChats = () => {

  };

  const raiseHand = () => {

  };

  const lowerHand = () => {

  };

  const persistMeetingSettings = (autoPermit) => {

  };

  const endCall = () => {

  };

  return (
    <div className={'meeting-room-container'}>
      <div className={'meeting-room-content'} style={{
        height: displayState === 'MAXIMIZED' ? 'calc(100% - 72px)' : '90%',
        maxHeight: displayState === 'MAXIMIZED' ? 'calc(100% - 72px)' : '90%',
        overflow: displayState === 'MAXIMIZED' ? null : 'hidden',
      }}>
        <span>Mediasoup meeting room</span>
      </div>
      {
        device &&
        <div className={'footer-container no-margin no-padding'}>
          <Footer audioMuted={audioMuted}
                  hasUnreadChats={hasUnreadChats}
                  hasUnseenWhiteboardEvent={hasUnseenWhiteboardEvent}
                  participants={participants}
                  videoDisabled={videoDisabled}
                  videoMuted={videoMuted}
                  handRaised={handRaised}
                  isRecording={isRecording}
                  displayState={displayState}
                  screenShared={screenShared}
                  someoneSharing={someoneSharing !== null}
                  whiteBoardShown={showWhiteBoard}
                  isHost={isHost}
                  step={step}
                  autoPermit={autoPermit}
                  meetingTitle={selectedMeeting.title}
                  toolbarEventHandler={
                    {
                      onMuteVideo: (muted) => {
                        setVideoMuted(muted);
                      },
                      onMuteAudio: (muted) => {
                        setAudioMuted(muted);
                      },
                      recordMeeting: () => {
                        recordMeeting();
                      },
                      stopRecording: () => {
                        stopRecordingMeeting();
                      },
                      endCall: () => {
                        handleEndCall();
                      },
                      shareScreen: () => {
                        if (device) {
                          shareScreen();
                        }
                      },
                      stopShareScreen: () => {
                        if (device) {
                          stopShareScreen();
                        }
                      },
                      showPeople: () => {
                        setSideBarTab('People');
                        setSideBarOpen(true);
                      },
                      showWhiteboard: () => {
                        if (meetingParticipantGridMode === 'DEFAULT') {
                          setMeetingParticipantGridMode('STRIP');
                          setShowWhiteBoard(true);
                        } else {
                          setMeetingParticipantGridMode('DEFAULT');
                          setShowWhiteBoard(false);
                        }

                        setHasUnseenWhiteboardEvent(false);
                      },
                      showChat: () => {
                        fetchChats();
                      },
                      raiseHand: () => {
                        raiseHand();
                      },
                      lowerHand: () => {
                        lowerHand();
                      },
                      toggleAutoPermit: () => {
                        persistMeetingSettings(autoPermit)
                      },
                      closeWindow: () => {
                        endCall();
                        props.closeHandler();
                      },
                    }
                  }
          />
        </div>
      }
    </div>
  );
};

export default MeetingRoom;

