import React, {Fragment, useEffect, useRef, useState} from 'react';

import '../../Calendar.css';
import './MeetingRoom.css';
import Footer from "../../../meetingroom/Footer";
import appManager from "../../../../service/AppManager";
import {MessageType, SystemEventType} from "../../../../types";
import peerManager from "../../../../service/simplepeer/PeerManager";
import socketManager from "../../../../service/SocketManager";
import MeetingRoomSideBarContent from "../../../meetingroom/SideBarContent";
import ClosablePanel from "../../../layout/ClosablePanel";
import MediaSoupHelper from './MediaSoupHelper';
import Utils from "../../../../Utils";

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
  const isRecordingRef = useRef(false);
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
  const [allUserParticipantsLeft, setAllUserParticipantsLeft] = useState(false);
  const onloadScreenShareData = useRef(null);
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
    initMeetingSession();

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

  /********************************* HANDSHAKE *******************************/

  function initMeetingSession() {
    if (isHost || isDirectCall || isRequestToJoin || autoPermit) {
      console.log("CALLING JOIN FROM INIT initMeetingSession()");
      join();
    } else {
      askForPermission();
    }
  }

  const askForPermission = () => {
    let userDetails = appManager.getUserDetails();
    const userAlias = Utils.isNull(userDetails.userId) ? `${userDetails.name} (Guest)` : userDetails.userId;

    // TODO : Implement re-try and timeout
    socketManager.emitEvent(MessageType.PERMISSION, {
      user: userAlias,
      room: selectedMeeting.id,
      email: userDetails.emailAddress,
    }).then((data) => {
    }).catch((exp) => {
      setPreErrorStep(step);
      setStep(exp.message);
    });
  };

  function addUserToParticipants(item) {
    // Typically, a user shoud not exist. We are ensuring that there are never duplicates
    console.log("SEARCHING USER : " + item.user.userId);
    console.log(participants);
    let user = participants.find((u) => u.userId === item.user.userId);
    if (user) {
      console.log("FOUND EXISTING USER : ", user);
      user.name = item.user.name;
      user.avatar = item.user.avatar;
      user.audioMuted = item.user.audioMuted;
      user.videoMuted = item.user.videoMuted;
    } else {
      console.log("DID NOT FIND EXISTING USER : ", user);
      user = {
        userId: item.user.userId,
        name: item.user.name,
        avatar: item.user.avatar,
        audioMuted: item.user.audioMuted,
        videoMuted: item.user.videoMuted
      };

      participants.push(user);
      setParticipants([].concat(participants));
    }

    console.log("CHECK SCREEN SHARE ONLOAD");
    if (onloadScreenShareData.current && onloadScreenShareData.current.userId === item.user.userId) {
      // TODO : Add screen share code
      setMeetingParticipantGridMode('STRIP');
      onloadScreenShareData.current = null;
    }
  }

  const createParticipants = (users, socket) => {
    console.log("ALL USERS received and creating participants : ", users);
    users.forEach((user) => {
      console.log("ADDING ITEM TO PARTICIPANTS : ", user);
      addUserToParticipants(user);
      setAllUserParticipantsLeft(false);
      if (peerManager.userPeerMap.length > 0) {
        if (step === Steps.LOBBY) {
          setStep(Steps.SESSION);
          setSideBarTab('People');
          setSideBarOpen('true');
          props.windowHandler.show();
        }
      }
    });
  };

  const join = () => {
    let userDetails = appManager.getUserDetails();
    socketManager.emitEvent(MessageType.JOIN_MEETING, {
      room: selectedMeeting.id,
      userIdentity: userDetails.userId,
      name: userDetails.name,
      avatar: require('../../../../../desktop/dashboard/images/noimage-person.png'),
      email: userDetails.emailAddress,
      isHost: isHost,
      audioMuted: audioMuted,
      videoMuted: videoMuted,
      direct: isDirectCall,
      userToCall
    }).then((result) => {
      if (result.status === 'SUCCESS') {
        if (userToCall && isHost && isDirectCall) {
          socketManager.emitEvent(MessageType.CALL_USER, {
            room: selectedMeeting.id,
            userToCall: userToCall,
            callerId: socketManager.socket.id,
            name: appManager.getUserDetails().name
          }).catch((error) => {
          });
        }

        createParticipants(result.data.usersInRoom);

        if (result.data.whiteboard) {
          setWhiteboardItems(result.data.whiteboard.items);
        }

        if (isHost) {
          socketManager.emitEvent(MessageType.GET_LOBBY, {
            roomId: selectedMeeting.id
          }).then((result) => {
            if (result.status === 'SUCCESS' && result.lobby && result.lobby.people) {
              for (const person of result.lobby.people) {
                addUserToLobby(person);
              }
            }
          })
        }
      } else {
        setPreErrorStep(step);
        setStep(result.status);
      }
    }).catch((error) => {
      setPreErrorStep(step);
      setStep(error.message);
    });
  };

  /****************************** END HANDSHAKE ******************************/

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

  const handleSidebarToggle = (e) => {
    let paper = document.getElementById('meetingDialogPaper');
    if (e.detail.open) {
      paper.style.margin = '54px 0 0 144px';
    } else {
      paper.style.margin = '54px 0 0 0';
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
    setSideBarOpen(false);
    setSideBarTab('');
  };

  return (
    <div className={'meeting-room-container'}>
      <div className={'meeting-room-content'} style={{
        height: displayState === 'MAXIMIZED' ? 'calc(100% - 72px)' : '90%',
        maxHeight: displayState === 'MAXIMIZED' ? 'calc(100% - 72px)' : '90%',
        overflow: displayState === 'MAXIMIZED' ? null : 'hidden',
      }}>
        <div className={'row no-margin no-padding w-100 h-100'}>
          <div className={'participants-container col no-margin no-padding'}>

          </div>
          <div className={'closable-panel-container'}>
            <ClosablePanel
              closeHandler={(e) => {
                setSideBarOpen(false);
                setSideBarTab(null);
              }}
              title={sideBarTab}
            >
              <MeetingRoomSideBarContent
                meetingChat={meetingChat}
                isHost={isHost}
                tab={sideBarTab}
                meetingId={selectedMeeting.id}
                participants={participants}
                onAudioCallHandler={(requestedUser) => requestUserToJoin(requestedUser)}
                onAudioCallCancelHandler={(requestedUser) => cancelRequestCall(requestedUser)}
                onChangeMeetingHostHandler={(newHost) => {
                  changeHost(newHost);
                }}
                onPinHandler={(participant, pinned) => {
                  if (pinned) {
                    setPinnedParticipant(participant);
                  } else {
                    setPinnedParticipant(null);
                  }
                }}
                onHostAudioMute={(participant) => {
                  changeOtherParticipantAVSettings(participant.userId, true, participant.videoMuted);
                }}
                onHostVideoMute={(participant) => {
                  changeOtherParticipantAVSettings(participant.userId, participant.audioMuted, true);
                }}
              />
            </ClosablePanel>
          </div>
        </div>
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

