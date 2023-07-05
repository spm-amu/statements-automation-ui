import React, {useEffect, useRef, useState} from 'react';

import '../../Calendar.css';
import './MeetingRoom.css';
import Footer from "../../../meetingroom/Footer";
import appManager from "../../../../service/AppManager";
import {MessageType, SystemEventType} from "../../../../types";
import peerManager from "../../../../service/simplepeer/PeerManager";
import socketManager from "../../../../service/SocketManager";
import MeetingRoomSideBarContent from "../../../meetingroom/SideBarContent";
import ClosablePanel from "../../../layout/ClosablePanel";
import Utils from "../../../../Utils";
import MeetingParticipantGrid from "../../../meetingroom/mediasoup/MeetingParticipantGrid";
import {get, post} from "../../../../service/RestService";
import SelectScreenShareDialog from "../../../SelectScreenShareDialog";
import Alert from "react-bootstrap/Alert";
import Icon from "../../../Icon";
import Lobby from "../../../meetingroom/Lobby";

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
  const [isHost, setIsHost] = useState(props.isHost);
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
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [onloadScreenShareData, setOnloadScreenShareData] = useState(null);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [screenSources, setScreenSources] = useState();
  const shareScreenSource = useRef();
  const [screenSharePopupVisible, setScreenSharePopupVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState(null);
  const [chatSender, setChatSender] = useState(null);
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

  const handleChatMessage = (payload) => {
    if (!sideBarOpen && sideBarTab !== 'Chat') {
      setChatSender(payload.chatMessage.participant.label);
      setChatMessage(payload.chatMessage.content);

      if (payload.meetingId === selectedMeeting.id) {
        const messageTimeout = setTimeout(() => {
          setChatMessage(null);
          setChatSender(null);
          clearTimeout(messageTimeout);
        }, 4000);
      }

      setHasUnreadChats(true);
    }
  };

  const addUser = (payload) => {
    console.log("ADD USER : ", payload);
    addUserToParticipants(payload.user);
    setAllUserParticipantsLeft(false);
    if (step === Steps.LOBBY) {
      setStep(Steps.SESSION);
      props.windowHandler.show();
      setSideBarTab('People');
      setSideBarOpen(true);
    }

    if (screenShared) {
      // TODO : do the share screen stuff
    }

    handleMessageArrived({
      message: payload.user.name + " has joined"
    });

    joinInAudio.play().catch((e) => {
      console.log(e);
    });
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

  const onAVSettingsChange = (payload) => {
    let participant = participants.find((p) => p.userId === payload.userId);
    if (participant) {
      participant.audioMuted = payload.audioMuted;
      participant.videoMuted = payload.videoMuted;
    }

    //setParticipants([].concat(participants));
    appManager.fireEvent(SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED, payload);
  };

  function emitAVSettingsChange() {
    let userDetails = appManager.getUserDetails();
    socketManager.emitEvent(MessageType.AUDIO_VISUAL_SETTINGS_CHANGED, {
      meetingId: selectedMeeting.id,
      userId: userDetails.userId,
      audioMuted: audioMuted,
      videoMuted: videoMuted
    }).catch((error) => {
    });
  }

  /********************************** USE EFFECT **************************************/

  useEffect(() => {
    if (!Utils.isNull(screenShared)) {
      emitSystemEvent("SHARE_SCREEN", {
        shared: screenShared,
        userId: appManager.getUserDetails().userId
      });
    }
  }, [screenShared]);

  useEffect(() => {
    if (audioMuted !== null) {
      onAVSettingsChange({
        userId: appManager.getUserDetails().userId,
        videoMuted,
        audioMuted
      });

      emitAVSettingsChange();
      //soundMonitor.setAudioMuted(audioMuted);
    }
  }, [audioMuted]);

  useEffect(() => {
    if (videoMuted !== null) {
      onAVSettingsChange({
        userId: appManager.getUserDetails().userId,
        videoMuted,
        audioMuted
      });

      emitAVSettingsChange();
    }
  }, [videoMuted]);

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
    setIsHost(props.isHost);

    if (!isDirectCall && isHost) {
      persistMeetingSettings(props.autoPermit);
    }

    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    appManager.add('CURRENT_MEETING', selectedMeeting);

    return () => {
      endCall(false);
      setIsRecording(false);

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

  useEffect(() => {
    if (audioMuted !== null) {
      emitAVSettingsChange();
      //soundMonitor.setAudioMuted(audioMuted);
    }
  }, [audioMuted]);

  useEffect(() => {
    if (allUserParticipantsLeft) {
      if (!isDirectCall) {
        // TODO : Introduce a new step for this
        setStep(Steps.LOBBY);
        setShowWhiteBoard(false);
        setSideBarOpen(false);
        setMeetingParticipantGridMode('DEFAULT');
        if (screenShared) {
          stopShareScreen();
        }

        props.windowHandler.hide();
      } else {
        endCall();
        onCallEnded();
      }
    }
  }, [allUserParticipantsLeft]);

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

    socketManager.emitEvent(MessageType.PERMISSION, {
      userId: userAlias,
      userName: userDetails.name,
      room: selectedMeeting.id,
      email: userDetails.emailAddress,
    }).then((data) => {
    }).catch((exp) => {
      setPreErrorStep(step);
      setStep(exp.message);
    });
  };

  function addUserToParticipants(user) {
    // Typically, a user shoud not exist. We are ensuring that there are never duplicates
    console.log("SEARCHING PARTICIPANT : " + user.userId);
    console.log(participants);
    let participant = participants.find((u) => u.userId === user.userId);
    if (participant) {
      console.log("FOUND EXISTING PARTICIPANT : ", participant);
      participant.name = user.name;
      participant.avatar = user.avatar;
      participant.audioMuted = user.audioMuted;
      participant.videoMuted = user.videoMuted;
      participant.producers = user.producers;
    } else {
      console.log("DID NOT FIND EXISTING PARTICIPANT : ", participant);
      participant = {
        userId: user.userId,
        name: user.name,
        avatar: user.avatar,
        audioMuted: user.audioMuted,
        videoMuted: user.videoMuted,
        producers: user.producers
      };

      participants.push(participant);
      setParticipants([].concat(participants));
    }
  }

  const createParticipants = (users) => {
    console.log("ALL USERS received and creating participants : ", users);
    users.forEach((user) => {
      console.log("ADDING ITEM TO PARTICIPANTS : ", user);
      addUserToParticipants(user);
    });

    setAllUserParticipantsLeft(false);
    if (participants.length > 0) {
      if (step === Steps.LOBBY) {
        setStep(Steps.SESSION);
        setSideBarOpen(true);
        props.windowHandler.show();
      }
    }
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

        setRtpCapabilities(result.data.rtpCapabilities);
        setOnloadScreenShareData(result.data.shareScreenProducerData);

        /*let fakeDudes = [];
        for(let i=0;i<100;i++) {
          fakeDudes.push({
            userId: 'dude-' + i,
            name: 'Dude - ' + i,
            audioMuted: true,
            videoMuted: true
          })
        }

        createParticipants(fakeDudes);*/
        createParticipants(result.data.usersInRoom);

        if (result.data.whiteboard) {
          setWhiteboardItems(result.data.whiteboard.items);
        }

        if (isHost) {
          socketManager.emitEvent(MessageType.GET_LOBBY, {
            roomId: selectedMeeting.id
          }).then((result) => {
            console.log("\n\n\n\n\n\n\n\nLOBBY : ", result);
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
      console.log(error);
      setPreErrorStep(step);
      setStep(error.message);
    });
  };

  const addUserToLobby = (data) => {
    permitAudio.play();
    let item = {
      userId: data.userId,
      socketId: data.socketId
    };

    if (isHost && autoPermit === true) {
      acceptUser(item);
    } else {
      let find = lobbyWaitingList.find((u) => u.user === item.user);
      if (!find) {
        lobbyWaitingList.push(item);
        setLobbyWaitingList([].concat(lobbyWaitingList));
      }
    }
  };

  const acceptUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: true,
      userId: item.userId
    }).catch((error) => {
    });

    removeFromLobbyWaiting(item);
  };

  const rejectUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: false,
      userId: item.userId,
      meetingId: selectedMeeting.id
    }).catch((error) => {
    });

    removeFromLobbyWaiting(item);
  };

  const removeFromLobbyWaiting = (item) => {
    setLobbyWaitingList(lobbyWaitingList.filter((i) => i.user !== item.user));
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
      paper.style.margin = '54px 0 0 136px';
    } else {
      paper.style.margin = '54px 0 0 0';
    }
  };

  const onSystemEvent = (payload) => {
    if (payload.systemEventType === "SHARE_SCREEN") {
      let participant = participants.find((p) => p.userId === payload.data.userId);
      if (participant) {
        if (payload.data.shared) {
          if (participant.name) {
            handleMessageArrived({
              message: participant.name + " started sharing"
            });
          }
        }
      }
    } else if (payload.systemEventType === "HOST_CHANGED_AV_SETTINGS") {
      if (payload.data.userId === appManager.getUserDetails().userId) {
        onAVSettingsChange(payload.data);
        if (payload.data.audioMuted) {
          handleMessageArrived({
            message: "You have been muted by the meeting host"
          })
        } else if (payload.data.videoMuted) {
          handleMessageArrived({
            message: "Your video has been turned off by the meeting host"
          })
        }
      }
    }
  };

  const emitSystemEvent = (eventType, data, toParticipantIds = null) => {
    let participantIds = [];
    if (!toParticipantIds) {
      for (const participant of participants) {
        if (participant.userId !== appManager.getUserDetails().userId) {
          participantIds.push(participant.userId);
        }
      }
    } else {
      participantIds = participantIds.concat(toParticipantIds);
    }

    socketManager.emitEvent(MessageType.SYSTEM_EVENT, {
      systemEventType: eventType,
      recipients: participantIds,
      data: data
    }).catch((error) => {
    });
  };

  const recordMeeting = () => {
    setIsRecording(true);
    emitSystemEvent("MEETING_RECORDING", {
      recording: true,
      userId: appManager.getUserDetails().userId
    });
  };

  const stopRecordingMeeting = () => {
    setIsRecording(false);
    emitSystemEvent("MEETING_RECORDING", {
      recording: false,
      userId: appManager.getUserDetails().userId
    });
  };

  /********************************** HANG-UP *******************************/

  const removeUser = (user) => {

    console.log("REMOVING USER : ");
    console.log(user);

    if (selectedMeeting.id === user.meetingId) {
      const userId = user.userId;
      const find = participants.find((p) => p.userId === userId);

      console.log("REMOVING USER - CHECKING USER : ");
      console.log(find);

      if (find) {
        const newParticipants = participants.filter((p) => p.userId !== userId);
        if (newParticipants.length === 0 && isDirectCall) {
          onCallEnded();
          props.closeHandler();
        } else {
          setParticipants(newParticipants);
          if (newParticipants.length === 0 && step !== Steps.CONNECTION_ERROR) {
            setAllUserParticipantsLeft(true);

            get(
              `${appManager.getAPIHost()}/api/v1/meeting/end/${selectedMeeting.id}`,
              (response) => {
              },
              (e) => {
              },
              '',
              true
            );
          }
        }
      }
    }
  };

  const endCall = (showMessage = true) => {
    socketManager.endCall(isDirectCall, callerUser, selectedMeeting.id);
    props.onEndCall(isDirectCall, showMessage);
    setSideBarOpen(false);
    setSideBarTab('');
  };

  const onCallEnded = (showMessage = true) => {
    socketManager.removeSubscriptions(eventHandler);
    appManager.removeSubscriptions(systemEventHandler);
    socketManager.disconnectSocket();
    socketManager.init();
    props.onEndCall(isDirectCall, showMessage);
    props.closeHandler();
  };

  const handleEndCall = () => {
    if (userToCall && isDirectCall && participants.length <= 1) {
      socketManager.emitEvent(MessageType.CANCEL_CALL, {
        userId: userToCall.userId,
        userDescription: userToCall.name,
        callerId: appManager.getUserDetails().userId,
        callerDescription: appManager.getUserDetails().name,
        meetingId: selectedMeeting.id
      }).catch((error) => {
      });

      onCallEnded(false);
    } else {
      endCall(false);
      props.closeHandler();
    }
  };

  /******************************** END HANG-UP *****************************/

  const selectSourceHandler = (selectedSource) => {
    setScreenSharePopupVisible(false);
    shareScreenSource.current = selectedSource;

    if (screenSources && selectedSource) {
      setScreenShared(true);
      /*if (shareScreenSource.current.name.toLowerCase() !== 'entire screen' && shareScreenSource.current.name.toLowerCase() !== 'armscor connect') {
        setMeetingParticipantGridMode('STRIP');
      }*/
    }
  };

  const shareScreen = () => {
    electron.ipcRenderer.getSources()
      .then(sources => {
        if (sources && sources.length > 0) {
          setScreenSources(sources);
          setScreenSharePopupVisible(true);
        }
      });
  };

  const stopShareScreen = () => {
    setScreenShared(false);
  };

  const fetchChats = () => {

  };

  const raiseHand = () => {

  };

  const lowerHand = () => {

  };

  const persistMeetingSettings = (autoPermit) => {
    post(
      `${appManager.getAPIHost()}/api/v1/meeting/settings`,
      (response) => {
      },
      (e) => {
      },
      {
        meetingId: selectedMeeting.id,
        askToJoin: autoPermit
      }, null, false
    );
  };

  const onChangeHost = (args) => {
    let userDetails = appManager.getUserDetails();
    setIsHost(userDetails.userId === args.payload.host);
  };

  const changeHost = (participant) => {
    post(
      `${appManager.getAPIHost()}/api/v1/meeting/changeHost`,
      (response) => {
        socketManager.emitEvent(MessageType.CHANGE_HOST, {
          roomID: selectedMeeting.id,
          host: participant.userId,
          state: {
            meetingStarted: props.meetingStarted
          }
        }).catch((error) => {
        });

        setIsHost(!isHost);
      },
      (e) => {
      },
      {
        meetingId: selectedMeeting.id,
        userId: participant.userId
      },
      '',
      false
    );
  };

  const changeOtherParticipantAVSettings = (userId, audioMuted, videoMuted) => {
    socketManager.emitEvent(MessageType.SYSTEM_EVENT, {
      systemEventType: "HOST_CHANGED_AV_SETTINGS",
      recipients: [userId],
      data: {
        userId,
        audioMuted,
        videoMuted
      }
    }).catch((error) => {
    });
  };

  return (
    <div className={'meeting-room-container'}>
      <div className={'meeting-room-content'} style={{
        height: displayState === 'MAXIMIZED' ? 'calc(100% - 96px)' : '90%',
        maxHeight: displayState === 'MAXIMIZED' ? 'calc(100% - 96px)' : '90%',
        overflow: displayState === 'MAXIMIZED' ? null : 'hidden',
      }}>
        <div className={'row no-margin no-padding w-100 h-100'}>
          <div className={'participants-container col no-margin no-padding'}>
            {
              step === Steps.LOBBY &&
              <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={userToCall} displayState={displayState}
                     meetingTitle={selectedMeeting.title} videoMuted={videoMuted}
                     waitingList={lobbyWaitingList}
                     acceptUserHandler={
                       (item) => {
                         acceptUser(item);
                       }}
                     rejectUserHandler={
                       (item) => {
                         rejectUser(item);
                       }}
              />
            }
            {
              step === Steps.SESSION &&
              <MeetingParticipantGrid participants={participants}
                                      waitingList={lobbyWaitingList}
                                      mode={meetingParticipantGridMode}
                                      audioMuted={audioMuted}
                                      videoMuted={videoMuted}
                                      meetingTitle={selectedMeeting.title}
                                      userToCall={userToCall}
                                      shareScreenSource={shareScreenSource.current}
                                      meetingId={selectedMeeting.id}
                                      onGridSetup={() => {
                                        setSideBarTab('People');
                                      }}
                                      step={step}
                                      isHost={isHost}
                                      isRecording={isRecording}
                                      screenShared={screenShared}
                                      whiteBoardShown={showWhiteBoard}
                                      sharingHandler={(someoneSharing) => setSomeoneSharing(someoneSharing)}
                                      autoPermit={autoPermit}
                                      rtpCapabilities={rtpCapabilities}
                                      onloadScreenShareData={onloadScreenShareData}
                                      allUserParticipantsLeft={allUserParticipantsLeft}
                                      onHostAudioMute={(participant) => {
                                        changeOtherParticipantAVSettings(participant.userId, true, participant.videoMuted);
                                      }}
                                      onHostVideoMute={(participant) => {
                                        changeOtherParticipantAVSettings(participant.userId, participant.audioMuted, true);
                                      }}
                                      acceptUserHandler={
                                        (item) => {
                                          acceptUser(item);
                                        }}
                                      rejectUserHandler={
                                        (item) => {
                                          rejectUser(item);
                                        }}
              />
            }
            <>
              <Alert
                variant={'info'}
                show={activityMessage !== null}
                fade={true}
              >
                <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{activityMessage}</p>
              </Alert>
              <Alert
                variant={'info'}
                show={chatMessage !== null}
                fade={true}
              >
                <div className={'row'} style={{borderBottom: '1px solid white', paddingBottom: '8px'}}>
                  <div className={'col'}>
                    <div className={'row'}>
                      <div>
                        <Icon id={'CHAT_BUBBLE'}/>
                      </div>
                      <div className={'col'}>
                        <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{chatSender}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={'row'} style={{marginTop: '8px'}}>
                  <div className={'col'}><p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{chatMessage}</p></div>
                </div>
              </Alert>
            </>
          </div>
          {
            sideBarOpen &&
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
                  onHostAudioMute={(participant) => {
                    changeOtherParticipantAVSettings(participant.userId, true, participant.videoMuted);
                  }}
                  onHostVideoMute={(participant) => {
                    changeOtherParticipantAVSettings(participant.userId, participant.audioMuted, true);
                  }}
                />
              </ClosablePanel>
            </div>
          }
          {
            screenSharePopupVisible &&
            <SelectScreenShareDialog
              handleCloseHandler={() => {
                setScreenSharePopupVisible(false);
                setScreenShared(false);
              }}
              open={screenSharePopupVisible}
              sources={screenSources}
              selectSourceHandler={(selectedSource) => selectSourceHandler(selectedSource)}
            />
          }
        </div>
      </div>
      {
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
                  someoneSharing={someoneSharing}
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
                        shareScreen();
                      },
                      stopShareScreen: () => {
                        stopShareScreen();
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
