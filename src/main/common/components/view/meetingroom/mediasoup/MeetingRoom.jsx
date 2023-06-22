import React, {Fragment, useState} from 'react';

import '../../Calendar.css';
import './MeetingRoom.css';
import Footer from "../../../meetingroom/Footer";
import appManager from "../../../../service/AppManager";
import {MessageType, SystemEventType} from "../../../../types";
import peerManager from "../../../../service/simplepeer/PeerManager";

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
//const errorAudio = new Audio(appManager.getSoundFileHost() + '/error.mp3');
//const waitingAudio = new Audio(appManager.getSoundFileHost() + '/waiting.mp3');

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

