import React, {Fragment, useEffect, useRef, useState} from 'react';

import './Calendar.css';
import './MeetingRoom.css';
import Dialog from "@material-ui/core/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import Footer from "../vc/Footer";
import socketManager from "../../service/SocketManager";
import {MessageType, SystemEventType} from "../../types";
import Utils from "../../Utils";
import MeetingParticipantGrid from '../vc/CenteredMeetingParticipantGrid';
import ClosablePanel from "../layout/ClosablePanel";
import MeetingRoomSideBarContent from "../vc/MeetingRoomSideBarContent";
import appManager from "../../../common/service/AppManager";
import MeetingRoomSummary from "../vc/MeetingRoomSummary";
import {get, post} from '../../service/RestService';
import SelectScreenShareDialog from '../SelectScreenShareDialog';
import {osName} from "react-device-detect";
import {Stream} from "../../service/Stream";
import WhiteBoard from "../whiteboard/WhiteBoard";
import Alert from "react-bootstrap/Alert";
import Icon from "../Icon";

const {electron} = window;

const StyledDialog = withStyles({
  root: {pointerEvents: "none"},
  paper: {
    pointerEvents: 'auto',
    width: '100%',
    height: '100%',
    maxWidth: 'calc(100% - 144px)',
    maxHeight: 'calc(100% - 48px)',
    margin: '54px 0 0 144px',
    padding: '0',
    overflow: 'hidden',
    boxShadow: 'none !important',
    ['@media (max-width:800px)']: {
      margin: '54px 0 0 0',
      maxWidth: '100%'
    }
  }
})(props => <Dialog hideBackdrop {...props} />);

const PaperComponent = (props) => (
  <Draggable
    disabled={props.disabled}
    handle="#meeting-title"
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

const Steps = {
  LOBBY: 'LOBBY',
  SESSION: 'SESSION',
  SESSION_ENDED: 'SESSION_ENDED'
};

const hangUpAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/hangupsound.mp3');
const joinInAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/joinsound.mp3');
const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');
const errorAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/error.mp3');
const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

const MeetingRoom = (props) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarTab, setSideBarTab] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [displayState, setDisplayState] = useState(props.displayState);
  const [participants, setParticipants] = useState([]);
  const [meetingChat, setMeetingChat] = useState(null);
  const [participantsRaisedHands, setParticipantsRaisedHands] = useState([]);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [step, setStep] = useState('LOBBY');
  const [currentUserStream] = useState(new Stream());
  const [streamsInitiated, setStreamsInitiated] = useState(false);
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [handRaised, setHandRaised] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [autoPermit, setAutoPermit] = useState(false);
  const [screenSharePopupVisible, setScreenSharePopupVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [screenSources, setScreenSources] = useState();
  const [meetingParticipantGridMode, setMeetingParticipantGridMode] = useState('DEFAULT');
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [allUserParticipantsLeft, setAllUserParticipantsLeft] = useState(false);
  const [whiteboardItems, setWhiteboardItems] = useState([]);
  const [eventHandler] = useState({});
  const [userVideo, setUserVideo] = useState(null);
  const [activityMessage, setActivityMessage] = useState(null);
  const [chatMessage, setChatMessage] = useState(null);
  const [chatSender, setChatSender] = useState(null);
  const [hasUnreadChats, setHasUnreadChats] = useState(null);
  const [hasUnseenWhiteboardEvent, setHasUnseenWhiteboardEvent] = useState(null);
  const recordedChunks = [];
  const shareScreenSource = useRef();
  const tmpVideoTrack = useRef();

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
          case MessageType.ALL_USERS:
            if (userToCall && isHost && isDirectCall) {
              socketManager.emitEvent(MessageType.CALL_USER, {
                room: selectedMeeting.id,
                userToCall: userToCall,
                callerId: socketManager.socket.id,
                name: appManager.getUserDetails().name,
                mainStreamId: currentUserStream.obj.id,
                shareStreamId: currentUserStream.shareScreenObj.id
              });
            }

            createParticipants(be.payload);
            break;
          case MessageType.USER_JOINED:
            addUser(be.payload);
            break;
          case MessageType.RECEIVING_RETURNED_SIGNAL:
            socketManager.signal(be.payload);
            break;
          case MessageType.USER_LEFT:
            removeUser(be.payload);
            break;
          case MessageType.CALL_ENDED:
            onCallEnded();
            break;
          case MessageType.RAISE_HAND:
            onRaiseHand(be.payload);
            break;
          case MessageType.LOWER_HAND:
            onLowerHand(be.payload);
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
          case MessageType.WHITEBOARD:
            if (be.payload) {
              setWhiteboardItems(be.payload.items);
            }
            break;
          case MessageType.CHANGE_HOST:
            onChangeHost(be);
            break;
          case MessageType.CHAT_MESSAGE:
            handleChatMessage(be.payload);
            break;
        }
      }
    }
  };

  const {
    selectedMeeting,
    userToCall,
    isDirectCall,
    callerUser
  } = props;

  const onChangeHost = (args) => {
    let userDetails = appManager.getUserDetails();
    setIsHost(userDetails.userId === args.payload.host);
  };

  const recordMeeting = () => {
    if (mediaRecorder != null) {
      mediaRecorder.start();
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: selectedMeeting.id,
        isRecording: true
      });
      setIsRecording(true);
      updateRecordingStatus(true);
    }
  };

  const updateWhiteboardEvents = (e) => {
    if (whiteboardItems.length === 0) {
      let userId = atob(e.metadata.id.split("-")[0]);
      let participant = participants.find((p) => p.userId === userId);

      if (participant) {
        handleMessageArrived({
          message: participant.name + " has started a whiteboard"
        });
      }
    }

    let find = whiteboardItems.find((i) => i.id === e.metadata.id);
    if (find) {
      const properties = Object.getOwnPropertyNames(e.metadata);
      for (const property of properties) {
        find[property] = e.metadata[property];
      }
    } else {
      whiteboardItems.push(e.metadata);
    }

    if (!showWhiteBoard) {
      setHasUnseenWhiteboardEvent(true);
    }
  };

  const stopRecordingMeeting = () => {
    if (mediaRecorder != null) {
      mediaRecorder.stop();
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: selectedMeeting.id,
        isRecording: false
      });
      setIsRecording(false);
      updateRecordingStatus(false);
    }
  };

  const raiseHand = () => {
    let userDetails = appManager.getUserDetails();

    socketManager.emitEvent(MessageType.RAISE_HAND, {
      userId: userDetails.userId,
      roomID: selectedMeeting.id
    });

    setHandRaised(!handRaised)
  };

  const lowerHand = () => {
    let userDetails = appManager.getUserDetails();

    socketManager.emitEvent(MessageType.LOWER_HAND, {
      userId: userDetails.userId,
      roomID: selectedMeeting.id
    });

    setHandRaised(!handRaised)
  };

  const removeUser = (user) => {
    if (selectedMeeting.id === user.meetingId) {
      socketManager.removeFromUserToPeerMap(user.id);

      const userId = user.alias;
      const newParticipants = participants.filter((p) => p.userId !== userId);

      if (newParticipants.length === 1 && isDirectCall) {
        onCallEnded();
        //props.closeHandler();
      } else {
        setParticipants(newParticipants);
        if (newParticipants.length === 0) {
          //onCallEnded();
          //props.closeHandler();
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
  };

  const handleScreenShareStream = (stream) => {
    tmpVideoTrack.current = currentUserStream.getVideoTracks()[0];

    socketManager.userPeerMap.forEach((peerObj) => {
      peerObj.peer.replaceTrack(
        currentUserStream.getVideoTracks()[0], // prev video track - webcam
        stream.getVideoTracks()[0], // current video track - screen track
        currentUserStream.obj
      );
    });

    currentUserStream.removeTrack(currentUserStream.getVideoTracks()[0]);
    currentUserStream.addTrack(stream.getVideoTracks()[0]);
    userVideo.current.srcObject = currentUserStream.obj;

    createMediaRecorder(stream);
  };

  const handleDataAvailable = (e) => {
    recordedChunks.push(e.data);
  };

  const handleStop = async (e) => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (evt) {
      const result = evt.target.result;
      const data = {
        meetingId: selectedMeeting.id,
        name: selectedMeeting.title,
        type: blob.type,
        size: blob.size,
        payload: result
      };

      post(
        `${appManager.getAPIHost()}/api/v1/document/saveToFile`,
        (response) => {
        },
        (e) => {
        },
        data,
        '',
        false
      );
    }
  };

  const changeHost = (participant) => {
    post(
      `${appManager.getAPIHost()}/api/v1/meeting/changeHost`,
      (response) => {
        socketManager.emitEvent(MessageType.CHANGE_HOST, {
          roomID: selectedMeeting.id,
          host: participant.userId
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

  const updateRecordingStatus = (recordingStatus) => {
    post(
      `${appManager.getAPIHost()}/api/v1/meeting/updateRecordingStatus`,
      () => {
      },
      (e) => {
        console.error(e);
      },
      {
        meetingId: selectedMeeting.id,
        recording: recordingStatus
      },
      '',
      false
    );
  };

  const stopShareScreen = () => {
    shareScreenSource.current = null;
    setScreenShared(false);

    socketManager.userPeerMap.forEach((peerObj) => {
      peerObj.peer.replaceTrack(
        currentUserStream.getVideoTracks()[0], // prev video track - webcam
        tmpVideoTrack.current, // current video track - screen track
        currentUserStream.obj
      );
    });

    currentUserStream.removeTrack(currentUserStream.getVideoTracks()[0]);
    currentUserStream.addTrack(tmpVideoTrack.current);

    userVideo.current.srcObject = currentUserStream.obj;
  };

  const selectSourceHandler = (selectedSource) => {
    setScreenSharePopupVisible(false);
    shareScreenSource.current = selectedSource;

    if (screenSources && selectedSource) {
      setScreenShared(true);
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

  useEffect(() => {
    if (displayState) {
      setDisplayState(props.displayState);
    }
  }, [props.displayState]);

  useEffect(() => {
    if (screenShared) {
      const videoConstraints = {
        cursor: true,
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
          },
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: shareScreenSource.current.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      };

      if (osName === 'Mac OS') {
        videoConstraints.audio = false;
      }

      navigator.mediaDevices
        .getUserMedia(videoConstraints)
        .then((stream) => {
          handleScreenShareStream(stream);
        })
        .catch(e => {
          console.log(e)
        });
    }

    emitAVSettingsChange();
  }, [screenShared]);

  useEffect(() => {
    setAutoPermit(props.autoPermit);
  }, [props.autoPermit]);

  useEffect(() => {
    if (allUserParticipantsLeft) {
      if (!isDirectCall) {
        // TODO : Introduce a new step for this
        setStep(Steps.LOBBY);
        props.windowHandler.hide();
      } else {
        endCall();
        onCallEnded();
      }
    }
  }, [allUserParticipantsLeft]);

  const addUser = (payload) => {
    socketManager.mapUserToPeer(payload, currentUserStream, MessageType.USER_JOINED, audioMuted, videoMuted)
      .then((item) => {
        console.log("ADD USER : ", payload);
        let user = {
          peerID: item.user.callerID,
          userId: item.user.userAlias,
          peer: item.peer,
          name: item.user.name,
          avatar: item.user.avatar,
          audioMuted: payload.audioMuted,
          videoMuted: payload.videoMuted,
          stream: item.mainStream,
          shareStream: item.shareStream
        };

        setParticipants((participants) => [...participants, user]);
        setAllUserParticipantsLeft(false);
        if (step === Steps.LOBBY) {
          setStep(Steps.SESSION);
          props.windowHandler.show();
        }

        joinInAudio.play();
      });
  };

  const createParticipants = (users, socket) => {
    socketManager.clearUserToPeerMap();
    users.forEach((user) => {
      socketManager.mapUserToPeer(user, currentUserStream, MessageType.ALL_USERS, audioMuted, videoMuted)
        .then((item) => {
          console.log("ADDING ITEM TO PARTICIPANTS : ", item);

          let user = {
            userId: item.user.userAlias,
            peer: item.peer,
            name: item.user.name,
            avatar: item.user.avatar,
            audioMuted: item.user.audioMuted,
            videoMuted: item.user.videoMuted,
            stream: item.mainStream,
            shareStream: item.shareStream,
          };

          participants.push(user);

          if (participants.length === userPeerMap.length) {
            setParticipants(participants);
            setAllUserParticipantsLeft(false);
            if (userPeerMap.length > 0) {
              if (step === Steps.LOBBY) {
                setStep(Steps.SESSION);
                props.windowHandler.show();
              }
            }
          }

          handleMessageArrived({
            message: userToPeerItem.user.name + " has joined"
          });
        })
    });
  };

  const addUserToLobby = (data) => {
    permitAudio.play();
    let item = {
      user: data.userAlias,
      socketId: data.id
    };

    if (isHost && autoPermit === false) {
      acceptUser(item);
    } else {
      setLobbyWaitingList(lobbyWaitingList.concat([item]));
    }
  };

  const askForPermission = () => {
    let userDetails = appManager.getUserDetails();
    const userAlias = userDetails.userId;
    socketManager.emitEvent(MessageType.PERMISSION, {
      user: userAlias,
      room: selectedMeeting.id,
      email: userDetails.emailAddress,
    });
  };

  const join = () => {
    let userDetails = appManager.getUserDetails();
    socketManager.emitEvent(MessageType.JOIN_MEETING, {
      room: selectedMeeting.id,
      userIdentity: userDetails.userId,
      name: userDetails.name,
      avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      email: userDetails.emailAddress,
      isHost: isHost,
      audioMuted: audioMuted,
      videoMuted: videoMuted,
      mainStreamId: currentUserStream.obj.id,
      shareStreamId: currentUserStream.shareScreenObj.id,
      direct: isDirectCall,
      userToCall
    });
  };

  const requestUserToJoin = (requestedUser) => {
    let userDetails = appManager.getUserDetails();
    socketManager.emitEvent(MessageType.REQUEST_TO_JOIN, {
      roomId: selectedMeeting.id,
      callerName: userDetails.name,
      meetingJoinRequest: true,
      userToCall: requestedUser,
      callerUser: {
        userId: userDetails.userId,
        mainStreamId: currentUserStream.obj.id,
        shareStreamId: currentUserStream.shareScreenObj.id
      }
    });
  };

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    return () => {
      endCall();
      socketManager.removeSubscriptions(eventHandler);
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
      appManager.remove('CURRENT_MEETING');
    };
  }, []);

  useEffect(() => {
    if (currentUserStream.obj) {
      socketManager.addSubscriptions(eventHandler, MessageType.PERMIT, MessageType.ALLOWED, MessageType.USER_JOINED, MessageType.USER_LEFT,
        MessageType.ALL_USERS, MessageType.RECEIVING_RETURNED_SIGNAL, MessageType.CALL_ENDED, MessageType.RAISE_HAND, MessageType.LOWER_HAND,
        MessageType.AUDIO_VISUAL_SETTINGS_CHANGED, MessageType.MEETING_ENDED, MessageType.WHITEBOARD_EVENT, MessageType.WHITEBOARD,
        MessageType.CHANGE_HOST, MessageType.CHAT_MESSAGE);

      if (isHost || isDirectCall) {
        join();
      } else {
        askForPermission();
      }
    } else {
      socketManager.removeSubscriptions(eventHandler);
    }
  }, [streamsInitiated]);

  useEffect(() => {
    if(meetingChat) {
      setSideBarTab('Chat');
      setSideBarOpen(true);
      setHasUnreadChats(false);
    }
  }, [meetingChat]);

  const fetchChats = () => {
    get(`${appManager.getAPIHost()}/api/v1/chat/fetchMeetingChat/${selectedMeeting.id}`, (response) => {
      if (response && response.id) {
        setMeetingChat(response);
      }
    }, (e) => {

    }, '', false)
  };

  const setupStream = () => {
    currentUserStream.init(!videoMuted, true, (stream) => {
      setStreamsInitiated(true);
      createMediaRecorder(stream);
    }, (e) => {
      console.log(e);
    });
  };

  const createMediaRecorder = (stream) => {
    const options = {mimeType: "video/webm; codecs=vp9"};
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;

    setMediaRecorder(recorder);
  };

  useEffect(() => {
    setIsHost(props.isHost);

    if (!isDirectCall) {
      persistMeetingSettings();
    }

    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    //setupStream();
    appManager.add('CURRENT_MEETING', selectedMeeting);
  }, []);


  useEffect(() => {
    if (userVideo && userVideo.current && !userVideo.current.srcObject) {
      if (!streamsInitiated) {
        setupStream();
      }
    }
  }, [userVideo]);

  useEffect(() => {
    if (streamsInitiated) {
      userVideo.current.srcObject = currentUserStream.obj;
    }
  }, [streamsInitiated]);

  const persistMeetingSettings = () => {
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

  const handleSidebarToggle = (e) => {
    let paper = document.getElementById('meetingDialogPaper');
    if (e.detail.open) {
      paper.style.margin = '54px 0 0 144px';
    } else {
      paper.style.margin = '54px 0 0 0';
    }
  };

  const onRaiseHand = (payload) => {
    const raisedHandParticipant = participants.find(p => p.userId === payload.userId);
    setParticipantsRaisedHands(oldParticipants => [...oldParticipants, raisedHandParticipant]);
  };

  const onAVSettingsChange = (payload) => {
    let participant = participants.find((p) => p.userId === payload.userId);
    if (participant) {
      participant.screenShared = payload.screenShared;
      participant.audioMuted = payload.audioMuted;
      participant.videoMuted = payload.videoMuted;

      if (payload.screenShared) {
        handleMessageArrived({
          message: participant.name + " started sharing"
        })
      }
    }

    setParticipants([].concat(participants));
  };

  const onLowerHand = (payload) => {
    setParticipantsRaisedHands(participantsRaisedHands.filter((p) => p.userId !== payload.userId));
  };

  const endCall = () => {
    if (currentUserStream.obj) {
      socketManager.endCall(isDirectCall, callerUser);
    }

    closeStreams();
    props.onEndCall();
  };

  const closeStreams = () => {
    hangUpAudio.play();
    currentUserStream.close();
  };

  const onCallEnded = () => {
    closeStreams();

    socketManager.removeSubscriptions(eventHandler);
    socketManager.clearUserToPeerMap();
    socketManager.disconnectSocket();
    socketManager.init();
    if ((isHost && !isDirectCall) || (step !== Steps.SESSION)) {
      props.onEndCall();
      props.closeHandler();
    } else {
      setStep(Steps.SESSION_ENDED)
    }
  };


  const removeFromLobbyWaiting = (item) => {
    setLobbyWaitingList(lobbyWaitingList.filter((i) => i.user !== item.user));
  };

  const acceptUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: true,
      id: item.socketId
    });

    removeFromLobbyWaiting(item);
  };

  const rejectUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: false,
      id: item.socketId,
      meetingId: selectedMeeting.id
    });

    removeFromLobbyWaiting(item);
  };

  function emitAVSettingsChange() {
    let userDetails = appManager.getUserDetails();
    socketManager.emitEvent(MessageType.AUDIO_VISUAL_SETTINGS_CHANGED, {
      meetingId: selectedMeeting.id,
      userId: userDetails.userId,
      audioMuted: audioMuted,
      videoMuted: screenShared ? false : videoMuted,
      screenShared: screenShared
    });
  }

  function toggleVideo() {
    if (currentUserStream.obj) {
      if (userVideo && !Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
        if (!screenShared) {
          currentUserStream.enableVideo(!videoMuted, socketManager);
        }
      }
    }

    onAVSettingsChange({
      userId: appManager.getUserDetails().userId,
      videoMuted,
      audioMuted
    });
  }

  useEffect(() => {
    if (audioMuted !== null) {
      toggleAudio();
      emitAVSettingsChange();
    }
  }, [audioMuted]);

  useEffect(() => {
    if (userVideo && userVideo.current) {
      userVideo.current.srcObject = currentUserStream.obj;
    }
  }, [currentUserStream.videoTrack]);

  useEffect(() => {
    if (videoMuted !== null) {
      toggleVideo();
      emitAVSettingsChange();
    }
  }, [videoMuted]);

  const handleMessageArrived = (event) => {
    if (event.message && event.message.length > 0) {
      setActivityMessage(event.message);
      const messageTimeout = setTimeout(() => {
        setActivityMessage(null);
        clearTimeout(messageTimeout);
      }, 4000)
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

  function toggleAudio() {
    if (currentUserStream.obj && currentUserStream.getAudioTracks() && currentUserStream.getAudioTracks().length > 0) {
      let audioTrack = currentUserStream.getAudioTracks()[0];
      if (audioTrack && userVideo && !Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
        audioTrack.enabled = !audioMuted;
        emitAVSettingsChange();
      }
    }

    onAVSettingsChange({
      userId: appManager.getUserDetails().userId,
      videoMuted,
      audioMuted
    });
  }

  return (
    <Fragment>
      <div className={'row meeting-container'} style={{
        height: displayState === 'MAXIMIZED' ? '100%' : '90%',
        maxHeight: displayState === 'MAXIMIZED' ? '100%' : '90%',
        overflow: displayState === 'MAXIMIZED' ? null : 'hidden',
      }}>
        <div className={'col'} style={{
          paddingLeft: '0',
          paddingRight: '0',
          maxHeight: '100%',
          height: displayState === 'MAXIMIZED' ? null : '100%'
        }}>
          <div style={{height: '100%'}}>
            <div className={displayState === 'MAXIMIZED' ? 'workspace-max' : 'workspace-min'}>
              {
                displayState === 'MAXIMIZED' ?
                  <div className={'row no-margin no-padding'} style={{width: '100%', height: '100%'}}>
                    {
                      showWhiteBoard && meetingParticipantGridMode === 'STRIP' &&
                      <div className={'row no-margin no-padding'}
                           style={{width: '100%', height: 'calc(100% - 200px)', margin: '16px 0'}}>
                        <div className={'col no-margin no-padding'} style={{width: '100%'}}>
                          <WhiteBoard isHost={isHost} id={selectedMeeting.id} items={whiteboardItems} eventHandler={
                            {
                              onAddItem: (item) => {
                                whiteboardItems.push(item);
                              },
                              onDeleteItem: (item) => {
                                let filtered = whiteboardItems.filter((i) => i.id !== item.id);
                                whiteboardItems.splice(0, whiteboardItems.length);

                                for (const filteredElement of filtered) {
                                  whiteboardItems.push(filteredElement);
                                }
                              },
                              onUpdateItem: (item) => {
                                let filtered = whiteboardItems.filter((i) => i.id === item.id);
                                if (filtered.length > 0) {
                                  const properties = Object.getOwnPropertyNames(item);
                                  for (const property of properties) {
                                    filtered[0][property] = item[property];
                                  }
                                }
                              }
                            }
                          }/>
                        </div>
                      </div>
                    }
                    <div className={'row'} style={{
                      width: '100%',
                      height: meetingParticipantGridMode === 'DEFAULT' ? '100%' : "160px",
                      marginLeft: '0',
                      marginRight: '0'
                    }}>
                      <div className={'col'} style={{width: '100%', paddingLeft: '0', paddingRight: '0'}}>
                        {
                          step === Steps.SESSION_ENDED ?
                            <div style={{
                              backgroundColor: 'rgb(40, 40, 43)',
                              color: 'white',
                              fontSize: '24px',
                              width: '100%',
                              height: '100%'
                            }} className={'centered-flex-box'}>
                              {'The ' + (isDirectCall ? 'call' : 'meeting') + ' has been ended' + (isDirectCall ? '' : ' by the host')}
                            </div>
                            :
                            <MeetingParticipantGrid participants={participants}
                                                    waitingList={lobbyWaitingList}
                                                    mode={meetingParticipantGridMode}
                                                    audioMuted={audioMuted}
                                                    videoMuted={videoMuted}
                                                    meetingTitle={selectedMeeting.title}
                                                    userToCall={userToCall}
                                                    step={step}
                                                    isHost={isHost}
                                                    participantsRaisedHands={participantsRaisedHands}
                                                    allUserParticipantsLeft={allUserParticipantsLeft}
                                                    userVideoChangeHandler={(ref) => setUserVideo(ref)}
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
                      </div>
                    </div>
                  </div>
                  :
                  <MeetingRoomSummary participants={participants} participantsRaisedHands={participantsRaisedHands}/>
              }
            </div>
            {
              currentUserStream &&
              <Footer audioMuted={audioMuted}
                      hasUnreadChats={hasUnreadChats}
                      hasUnseenWhiteboardEvent={hasUnseenWhiteboardEvent}
                      participants={participants}
                      videoMuted={videoMuted}
                      userStream={currentUserStream.obj}
                      handRaised={handRaised}
                      isRecording={isRecording}
                      displayState={displayState}
                      screenShared={screenShared}
                      whiteBoardShown={showWhiteBoard}
                      isHost={isHost}
                      step={step}
                      autoPermit={autoPermit}
                      participantsRaisedHands={participantsRaisedHands}
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
                            if (userToCall && isDirectCall && participants.length <= 1) {
                              console.log("USER TO CALL : ", userToCall);
                              socketManager.emitEvent(MessageType.CANCEL_CALL, {
                                userId: userToCall.userId,
                                userDescription: userToCall.name,
                                callerId: appManager.getUserDetails().userId,
                                callerDescription: appManager.getUserDetails().name,
                                meetingId: selectedMeeting.id
                              });
                              onCallEnded();
                            } else {
                              endCall();
                              props.closeHandler();
                            }
                          },
                          shareScreen: () => {
                            if (currentUserStream.obj) {
                              shareScreen();
                            }
                          },
                          stopShareScreen: () => {
                            if (currentUserStream.obj) {
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
                            persistMeetingSettings()
                          },
                          closeWindow: () => {
                            endCall();
                            props.closeHandler();
                          },
                        }
                      }
              />
            }
          </div>
        </div>
        {
          sideBarOpen && sideBarTab && displayState === 'MAXIMIZED' &&
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
                participantsRaisedHands={participantsRaisedHands}
                participants={participants}
                onAudioCallHandler={(requestedUser) => requestUserToJoin(requestedUser)}
                onChangeMeetingHostHandler={(newHost) => {
                  changeHost(newHost);
                }}
              />
            </ClosablePanel>
          </div>
        }
        {
          screenSharePopupVisible &&
          <SelectScreenShareDialog
            handleCloseHandler={() => {
              setScreenSharePopupVisible(false)
            }}
            open={screenSharePopupVisible}
            sources={screenSources}
            selectSourceHandler={(selectedSource) => selectSourceHandler(selectedSource)}
          />
        }
      </div>
      <div style={{
        padding: '0 32px 0 32px',
        maxHeight: '64px',
        bottom: '72px',
        right: '16px',
        minWidth: '320px',
        zIndex: '1200',
        position: 'absolute'
      }}>
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
      </div>
    </Fragment>
  );
};

export default MeetingRoom;

