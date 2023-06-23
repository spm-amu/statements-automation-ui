import React, {Fragment, useEffect, useRef, useState} from 'react';

import '../../Calendar.css';
import './MeetingRoom.css';
import Dialog from "@material-ui/core/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import Footer from "../../../meetingroom/Footer";
import socketManager from "../../../../service/SocketManager";
import peerManager from "../../../../service/simplepeer/PeerManager";
import {MessageType, SystemEventType} from "../../../../types";
import Utils, {CONNECTION_ERROR_MESSAGE, STREAM_ERROR_MESSAGE, SYSTEM_ERROR_MESSAGE} from "../../../../Utils";
import MeetingParticipantGrid from '../../../meetingroom/simplepeer/MeetingParticipantGrid';
import ClosablePanel from "../../../layout/ClosablePanel";
import MeetingRoomSideBarContent from "../../../meetingroom/SideBarContent";
import appManager from "../../../../../common/service/AppManager";
import MeetingRoomSummary from "../../../meetingroom/MeetingRoomSummary";
import {get, post} from '../../../../service/RestService';
import SelectScreenShareDialog from '../../../SelectScreenShareDialog';
import {Stream} from "../../../../service/Stream";
import WhiteBoard from "../../../whiteboard/WhiteBoard";
import Alert from "react-bootstrap/Alert";
import Icon from "../../../Icon";
import soundMonitor from "../../../../service/SoundMonitor";

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

const MeetingRoom = (props) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarTab, setSideBarTab] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [displayState, setDisplayState] = useState(props.displayState);
  const [participants, setParticipants] = useState([]);
  const [pinnedParticipant, setPinnedParticipant] = useState(null);
  const [meetingChat, setMeetingChat] = useState(null);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [step, setStep] = useState('LOBBY');
  const [preErrorStep, setPreErrorStep] = useState('');
  const [currentUserStream] = useState(new Stream());
  const [streamsInitiated, setStreamsInitiated] = useState(false);
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [handRaised, setHandRaised] = useState(false);
  const [screenShared, setScreenShared] = useState(null);
  const [someoneSharing, setSomeoneSharing] = useState(null);
  const [autoPermit, setAutoPermit] = useState(false);
  const [screenSharePopupVisible, setScreenSharePopupVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoDisabled, setVideoDisabled] = useState(null);
  const [screenSources, setScreenSources] = useState();
  const [meetingParticipantGridMode, setMeetingParticipantGridMode] = useState('DEFAULT');
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [allUserParticipantsLeft, setAllUserParticipantsLeft] = useState(false);
  const [whiteboardItems, setWhiteboardItems] = useState([]);
  const [eventHandler] = useState({});
  const [audioLevelTransmissionHandler] = useState({});
  const [systemEventHandler] = useState({});
  const [activityMessage, setActivityMessage] = useState(null);
  const [chatMessage, setChatMessage] = useState(null);
  const [chatSender, setChatSender] = useState(null);
  const [meetingStarted, setMeetingStarted] = useState(null);
  const [hasUnreadChats, setHasUnreadChats] = useState(null);
  const [hasUnseenWhiteboardEvent, setHasUnseenWhiteboardEvent] = useState(null);
  const recordingSequence = useRef(0);
  const recordingSize = useRef(0);
  const recordingType = useRef('');
  const shareScreenSource = useRef();
  const currentRecordingId = useRef(null);
  const shareScreenRef = useRef();
  const recordRef = useRef();
  const isRecordingRef = useRef(false);
  const mediaRecorder = useRef(null);
  const tmpVideoTrack = useRef();
  const tmpShareScreenStream = useRef();
  const onloadScreenShareData = useRef(null);

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
            console.log("CALLING JOIN AFTER ALLOWED EVENT");
            join();
            break;
          case MessageType.PERMIT:
            addUserToLobby(be.payload);
            break;
          case MessageType.USER_JOINED:
            addUser(be.payload);
            break;
          case MessageType.RECEIVING_RETURNED_SIGNAL:
            peerManager.signal(be.payload);
            break;
          case MessageType.USER_LEFT:
            console.log("\n\nUSER_LEFT calling remove user");
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

            //if (preErrorStep === Steps.LOBBY) {
            //console.log("RE-JOINING FROM LOBBY AFTER CONNECT");
            //initMeetingSession();
            //} else
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
          case SystemEventType.PEER_DISCONNECT:
            be.payload.meetingId = selectedMeeting.id;
            if (be.payload.userId === someoneSharing) {
              setSomeoneSharing(null);
              setMeetingParticipantGridMode('DEFAULT');
            }

            if (screenShared) {
              setScreenShared(false);
              shareScreenSource.current = null;
              setMeetingParticipantGridMode('DEFAULT');
            }

            console.log("\n\nPEER_DISCONNECT calling remove user");
            removeUser(be.payload);
            break;
        }
      }
    }
  };

  const audioLevelTransmissionHandlerApi = () => {

  };

  const {
    selectedMeeting,
    userToCall,
    isDirectCall,
    isRequestToJoin,
    callerUser
  } = props;

  const onChangeHost = (args) => {
    let userDetails = appManager.getUserDetails();
    setIsHost(userDetails.userId === args.payload.host);
  };

  const recordMeeting = () => {
    if (mediaRecorder.current != null) {
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: selectedMeeting.id,
        isRecording: true
      }).then((data) => {
        currentRecordingId.current = data.id;
        mediaRecorder.current.start(60000);

        setIsRecording(true);
        isRecordingRef.current = true;
        emitSystemEvent("MEETING_RECORDING", {
          recording: true,
          userId: appManager.getUserDetails().userId
        });
      }).catch((error) => {
        console.log("RECORD START ERROR");
        console.log(error);
      });
    }
  };

  const onSystemAlert = (payload) => {
    if (payload.type === 'MEETING_STARTED_ALERT') {
      handleMessageArrived({
        message: payload.message
      })
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
    if (mediaRecorder.current != null) {
      mediaRecorder.current.stop();
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: selectedMeeting.id,
        isRecording: false
      }).catch((error) => {
      });

      setIsRecording(false);
      isRecordingRef.current = false;

      emitSystemEvent("MEETING_RECORDING", {
        recording: false,
        userId: appManager.getUserDetails().userId
      });
    }
  };

  const raiseHand = () => {
    let userDetails = appManager.getUserDetails();

    socketManager.emitEvent(MessageType.RAISE_HAND, {
      userId: userDetails.userId,
      roomID: selectedMeeting.id
    }).catch((error) => {
    });

    setHandRaised(!handRaised)
  };

  const lowerHand = () => {
    let userDetails = appManager.getUserDetails();

    socketManager.emitEvent(MessageType.LOWER_HAND, {
      userId: userDetails.userId,
      roomID: selectedMeeting.id
    }).catch((error) => {
    });

    setHandRaised(!handRaised)
  };

  const removeUser = (user) => {
    console.log("REMOVING USER : ");
    console.log(user);

    if (selectedMeeting.id === user.meetingId) {
      const userId = user.userId;
      const find = participants.find((p) => p.userId === userId);

      console.log("REMOVING USER - CHECKING USER : ");
      console.log(find);

      if (find) {
        peerManager.removeFromUserToPeerMap(userId);
        const newParticipants = participants.filter((p) => p.userId !== userId);

        if (newParticipants.length === 0 && isDirectCall) {
          //setStep(Steps.SESSION_ENDED);
          onCallEnded();
          props.closeHandler();
        } else {
          setParticipants(newParticipants);
          if (newParticipants.length === 0 && step !== Steps.CONNECTION_ERROR) {
            //onCallEnded();
            //props.closeHandler();
            setAllUserParticipantsLeft(true);
            //setStep(Steps.SESSION_ENDED);

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

  const onSystemEvent = (payload) => {
    if (payload.systemEventType === "SHARE_SCREEN") {
      let participant = participants.find((p) => p.userId === payload.data.userId);
      if (participant) {
        if (payload.data.shared) {
          handleMessageArrived({
            message: participant.name + " started sharing"
          });

          shareScreenRef.current.srcObject = participant.shareStream;
          setSomeoneSharing(payload.data.userId);
          setMeetingParticipantGridMode('STRIP');
        } else {
          shareScreenRef.current.srcObject = currentUserStream.shareScreenObj;
          setSomeoneSharing(null);
          setMeetingParticipantGridMode('DEFAULT');
        }
      } else if (payload.data.userJoining) {
        onloadScreenShareData.current = payload.data;
      }
    } else if (payload.systemEventType === "HOST_CHANGED_AV_SETTINGS") {
      if (payload.data.userId === appManager.getUserDetails().userId) {
        setAudioMuted(payload.data.audioMuted);
        setVideoMuted(payload.data.videoMuted);

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

  async function replaceShareScreenStream(peerObj, stream) {
    if (peerObj.peer.connected) {
      try {
        peerObj.peer.replaceTrack(
          currentUserStream.shareScreenObj.getVideoTracks()[0], // prev video track - webcam
          stream.getVideoTracks()[0], // current video track - screen track
          currentUserStream.shareScreenObj
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  const handleScreenShareStream = async (stream) => {
    //tmpVideoTrack.current = currentUserStream.shareScreenObj.getVideoTracks()[0];

    peerManager.userPeerMap.forEach((peerObj) => {
      replaceShareScreenStream(peerObj, stream);
    });

    //currentUserStream.shareScreenObj.removeTrack(currentUserStream.shareScreenObj.getVideoTracks()[0]);
    //currentUserStream.shareScreenObj.addTrack(stream.getVideoTracks()[0]);
    shareScreenRef.current.srcObject = stream;

    //createMediaRecorder(stream);
    //setMeetingParticipantGridMode('STRIP');

    //setSomeoneSharing(false);
  };

  const handleRecordingDataAvailable = (e) => {
    if (e.data.size > 0) {
      console.log("ADDED CHUNK : " + recordingSequence.current);
      const blob = new Blob([e.data], {
        type: "video/webm",
      });

      const data = {
        meetingId: selectedMeeting.id,
        name: selectedMeeting.title,
        type: blob.type,
        size: blob.size,
        sequenceNumber: recordingSequence.current,
        sessionId: currentRecordingId.current
      };

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function (evt) {
        const result = evt.target.result;
        recordingType.current = blob.type;
        recordingSize.current += blob.size;

        data.recordedData = result.replace('data:video/webm;base64,', '');

        console.log("======== SAVING RECORDING CHUNK =========");
        console.log(data);
        socketManager.emitEvent(MessageType.SAVE_RECORDING, data)
          .then((data) => {
            console.log("===== SAVE RECORDING SUCCESS ======");
            if (!isRecordingRef.current) {
              console.log("======= STOPPING RECORDING =======");
              const data = {
                meetingId: selectedMeeting.id,
                name: selectedMeeting.title,
                type: recordingType.current,
                size: recordingSize.current,
                sequenceNumber: recordingSequence.current,
                sessionId: currentRecordingId.current
              };

              socketManager.emitEvent(MessageType.STOP_RECORDING, data)
                .catch((error) => {
                });

              currentRecordingId.current = null;
              setIsRecording(false);
              recordingSequence.current = 0;
              recordingSize.current = 0;
              recordingType.current = '';

            }
          })
          .catch((error) => {
            console.log("===== SAVE RECORDING ERROR ======")
          });
      };

      recordingSequence.current++;
    } else {
      console.log("no data to push");
    }
  };

  const handleStopRecording = (e) => {
    isRecordingRef.current = false;
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

  const stopShareScreen = () => {
    shareScreenSource.current = null;
    setScreenShared(false);
    setMeetingParticipantGridMode('DEFAULT');

    if(currentUserStream.shareScreenObj.getVideoTracks()[0].length > 0) {
      currentUserStream.shareScreenObj.getVideoTracks()[0].enabled = false;
      currentUserStream.shareScreenObj.getVideoTracks()[0].stop();
      peerManager.userPeerMap.forEach((peerObj) => {
        if (peerObj.peer.connected) {
          try {
            peerObj.peer.removeTrack(
              currentUserStream.shareScreenObj.getVideoTracks()[0], // prev video track - webcam
              currentUserStream.shareScreenObj
            );
          } catch (e) {
            console.log(e);
          }
        }
      });

      currentUserStream.shareScreenObj.removeTrack(currentUserStream.shareScreenObj.getVideoTracks()[0]);
    }

    //currentUserStream.shareScreenObj.removeTrack(currentUserStream.shareScreenObj.getVideoTracks()[0]);
    //currentUserStream.shareScreenObj.addTrack(tmpVideoTrack.current);

    if (shareScreenRef.current) {
      shareScreenRef.current.srcObject = null;
    }

    for (const track of tmpShareScreenStream.current.getTracks()) {
      track.enabled = false;
      track.stop();
    }

    tmpShareScreenStream.current = null;
    setMeetingParticipantGridMode('DEFAULT');
  };

  const selectSourceHandler = (selectedSource) => {
    setScreenSharePopupVisible(false);
    shareScreenSource.current = selectedSource;

    if (screenSources && selectedSource) {
      setScreenShared(true);
      if (shareScreenSource.current.name.toLowerCase() !== 'entire screen' && shareScreenSource.current.name.toLowerCase() !== 'armscor connect') {
        setMeetingParticipantGridMode('STRIP');
      }
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
    setMeetingStarted(props.meetingStarted);
  }, [props.meetingStarted]);

  useEffect(() => {
    soundMonitor.setParticipants(participants);
  }, [participants]);

  useEffect(() => {
    if (screenShared) {
      const videoConstraints = {
        cursor: true,
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: shareScreenSource.current.id,
            width: {min: 160, ideal: 320, max: 640},
            height: {min: 120, ideal: 240, max: 480},
            frameRate: {
              min: 15,
              max: 15
            },
            googCpuOveruseDetection: true,
            googCpuOveruseEncodeUsage: true,
            googCpuOveruseThreshold: 70
          }
        }
      };

      navigator.mediaDevices
        .getUserMedia(videoConstraints)
        .then((stream) => {
          handleScreenShareStream(stream);
          tmpShareScreenStream.current = stream;
        })
        .catch(e => {
          console.log(e)
        });
    }

    if (!Utils.isNull(screenShared)) {
      emitSystemEvent("SHARE_SCREEN", {
        shared: screenShared,
        userId: appManager.getUserDetails().userId
      });
    }
  }, [screenShared]);

  useEffect(() => {
    setAutoPermit(props.autoPermit);
  }, [props.autoPermit]);

  useEffect(() => {
    if (allUserParticipantsLeft) {
      if (!isDirectCall) {
        // TODO : Introduce a new step for this
        setStep(Steps.LOBBY);
        setShowWhiteBoard(false);
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

  function addUserToParticipants(item, peerId = null) {
    // Typically, a user shoud not exist. We are ensuring that there are never duplicates
    console.log("SEARCHING USER : " + item.user.userId);
    console.log(participants);
    let user = participants.find((u) => u.userId === item.user.userId);

    if (user) {
      console.log("FOUND EXISTING USER : ", user);
      if (peerId) {
        user.peerID = peerId;
      }

      user.peer = item.peer;
      user.name = item.user.name;
      user.avatar = item.user.avatar;
      user.audioMuted = item.user.audioMuted;
      user.videoMuted = item.user.videoMuted;
      user.stream = item.mainStream;
      user.shareStream = item.shareStream;
    } else {
      console.log("DID NOT FIND EXISTING USER : ", user);
      user = {
        userId: item.user.userId,
        peer: item.peer,
        name: item.user.name,
        avatar: item.user.avatar,
        audioMuted: item.user.audioMuted,
        videoMuted: item.user.videoMuted,
        stream: item.mainStream,
        shareStream: item.shareStream,
        active: false,
        inView: false
      };

      if (peerId) {
        user.peerID = peerId;
      }

      participants.push(user);
      setParticipants([].concat(participants));
      //setParticipants((participants) => [...participants, user]);
    }

    console.log("CHECK SCREEN SHARE ONLOAD");
    if (onloadScreenShareData.current && onloadScreenShareData.current.userId === item.user.userId) {
      shareScreenRef.current.srcObject = item.shareStream;
      setSomeoneSharing(onloadScreenShareData.current.userId);
      setMeetingParticipantGridMode('STRIP');

      onloadScreenShareData.current = null;
    }
  }

  const addUser = (payload) => {
    peerManager.mapUserToPeer(payload, currentUserStream, MessageType.USER_JOINED, audioMuted, videoMuted)
      .then((item) => {
        console.log("ADD USER : ", payload);
        addUserToParticipants(item, item.user.callerSocketId);
        setAllUserParticipantsLeft(false);
        if (step === Steps.LOBBY) {
          setStep(Steps.SESSION);
          props.windowHandler.show();
          setSideBarTab('People');
          setSideBarOpen('true')
        }

        if (screenShared) {
          try {
            item.peer.replaceTrack(
              currentUserStream.shareScreenObj.getVideoTracks()[0],
              shareScreenRef.current.srcObject.getVideoTracks()[0],
              currentUserStream.shareScreenObj
            );

            emitSystemEvent("SHARE_SCREEN", {
              shared: screenShared,
              userId: appManager.getUserDetails().userId,
              userJoining: true
            }, [payload.userId]);
          } catch (e) {
            console.log(e);
          }
        }

        handleMessageArrived({
          message: item.user.name + " has joined"
        });

        joinInAudio.play();
      }).catch((e) => {

    });
  };

  const createParticipants = (users, socket) => {
    console.log("ALL_USERS received and creating participants : ", users);
    peerManager.clearUserToPeerMap();
    let newParticipants = [];
    users.forEach((user) => {
      peerManager.mapUserToPeer(user, currentUserStream, MessageType.ALL_USERS, audioMuted, videoMuted)
        .then((item) => {
          console.log("ADDING ITEM TO PARTICIPANTS : ", item);
          addUserToParticipants(item);
          setAllUserParticipantsLeft(false);
          if (peerManager.userPeerMap.length > 0) {
            if (step === Steps.LOBBY) {
              setStep(Steps.SESSION);
              setSideBarTab('People');
              setSideBarOpen('true');
              props.windowHandler.show();
            }
          }
        })
    });
  };

  const addUserToLobby = (data) => {
    permitAudio.play();
    let item = {
      user: data.userId,
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

  const join = () => {
    console.log("JOINING");
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

        console.log("JOIN FROMISE FULFILLED");
        createParticipants(result.data.usersInRoom);
        if (result.data.whiteboard) {
          setWhiteboardItems(result.data.whiteboard.items);
        }

        if (isHost) {
          socketManager.emitEvent(MessageType.GET_LOBBY, {
            roomId: selectedMeeting.id
          }).then((result) => {
            console.log("\n\n\nGET_LOBBY Result : ", result);
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

    console.log("\n\n\\n\nSYSTEM EVENT PARTICIPANTS : ", participantIds);

    socketManager.emitEvent(MessageType.SYSTEM_EVENT, {
      systemEventType: eventType,
      recipients: participantIds,
      data: data
    }).catch((error) => {
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
        userId: userDetails.userId
      }
    }).catch((error) => {
    });
  };

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

      //endCall(false);
      socketManager.removeSubscriptions(eventHandler);
      appManager.removeSubscriptions(systemEventHandler);
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
      appManager.remove('CURRENT_MEETING');
    };
  }, []);

  function initMeetingSession() {
    if (isHost || isDirectCall || isRequestToJoin || autoPermit) {
      console.log("CALLING JOIN FROM INIT initMeetingSession()");
      join();
    } else {
      askForPermission();
    }
  }

  useEffect(() => {
    if (currentUserStream.obj) {
      initMeetingSession();
    }
  }, [streamsInitiated]);

  useEffect(() => {
    if (meetingChat) {
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

  const transmitAudioLevel = async (data, participants) => {
    if (participants) {
      //console.log("TRANSMITTING AUDIO LEVEL TO PARTS : ");
      //console.log(participants);
      for (const participant of participants) {
        if (participant.peer && participant.peer.connected) {
          //console.log("TRANSMITTING AUDIO LEVEL TO : " + participant.userId);
          //console.log((participant.peer ? participant.peer.connected : "NULL PEER"));
          participant.peer.send(JSON.stringify({userId: appManager.getUserDetails().userId, data}));
        }
      }
    }
  };

  const setupStream = () => {
    currentUserStream.init(!videoMuted, !audioMuted, (stream, shareStream, videoDisabled) => {
      setStreamsInitiated(true);
      soundMonitor.start(stream, async (data, participants, muted) => {
        if (data.level > 0 && !muted) {
          transmitAudioLevel(data, participants);
        }
      });

      createMediaRecorder().then((recorder) => {
        mediaRecorder.current = recorder;
        setVideoDisabled(videoDisabled);
      });
    }, (e) => {
      setVideoDisabled(true);
      console.log(e);

      setPreErrorStep(step);
      setStep(Steps.STREAM_ERROR);
    }, false, peerManager);
  };

  const createMediaRecorder = () => {
    return new Promise((resolve, reject) => {
      electron.ipcRenderer.getMainWindowId()
        .then((id) => {
          if (id) {
            const videoConstraints = {
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720
                }
              }
            };

            navigator.mediaDevices
              .getUserMedia(videoConstraints)
              .then((stream) => {
                stream.addTrack(currentUserStream.getAudioTracks()[0]);
                recordRef.current.srcObject = stream;

                const options = {
                  mimeType: "video/webm; codecs=vp9"
                };

                const recorder = new MediaRecorder(stream, options);

                recorder.ondataavailable = handleRecordingDataAvailable;
                recorder.onstop = handleStopRecording;

                resolve(recorder);
              })
              .catch(e => {
                console.log(e);
                reject(new Error(e.message));
              });
          } else {
            reject(new Error("Cannot initialize recorder. Application screen source not found"));
          }
        });
    });
  };

  useEffect(() => {
    setIsHost(props.isHost);

    if (!isDirectCall && props.isHost) {
      persistMeetingSettings(props.autoPermit);
    }

    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    setupStream();
    appManager.add('CURRENT_MEETING', selectedMeeting);
  }, []);

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

  const handleSidebarToggle = (e) => {
    let paper = document.getElementById('meetingDialogPaper');
    if (e.detail.open) {
      paper.style.margin = '54px 0 0 144px';
    } else {
      paper.style.margin = '54px 0 0 0';
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

  const endCall = (showMessage = true) => {
    if (currentUserStream.obj) {
      socketManager.endCall(isDirectCall, callerUser, selectedMeeting.id);
    }

    closeStreams();
    props.onEndCall(isDirectCall, showMessage);
  };

  const closeStreams = () => {
    hangUpAudio.play();
    currentUserStream.close();
    soundMonitor.stop();
  };

  const onCallEnded = (showMessage = true) => {
    closeStreams();

    socketManager.removeSubscriptions(eventHandler);
    appManager.removeSubscriptions(systemEventHandler);
    peerManager.clearUserToPeerMap();
    socketManager.disconnectSocket();
    socketManager.init();
    //if ((isHost && !isDirectCall) || (step !== Steps.SESSION)) {
    props.onEndCall(isDirectCall, showMessage);
    props.closeHandler();
    /*} else {
      setSomeoneSharing(false);
      setMeetingParticipantGridMode("DEFAULT");
      setStep(Steps.SESSION_ENDED);
      setScreenShared(false);
    }*/
  };

  const removeFromLobbyWaiting = (item) => {
    setLobbyWaitingList(lobbyWaitingList.filter((i) => i.user !== item.user));
  };

  const acceptUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: true,
      id: item.socketId
    }).catch((error) => {
    });

    removeFromLobbyWaiting(item);
  };

  const rejectUser = (item) => {
    socketManager.emitEvent(MessageType.PERMIT_STATUS, {
      allowed: false,
      id: item.socketId,
      meetingId: selectedMeeting.id
    }).catch((error) => {
    });

    removeFromLobbyWaiting(item);
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

  function toggleVideo() {
    if (currentUserStream.obj) {
      currentUserStream.enableVideo(!videoMuted, peerManager).then((stream) => {
        onAVSettingsChange({
          userId: appManager.getUserDetails().userId,
          videoMuted,
          audioMuted
        });
      });
    }
  }

  useEffect(() => {
    if (shareScreenRef.current) {
      shareScreenRef.current.srcObject = currentUserStream.shareScreenObj;
    }
  }, [shareScreenRef.current]);

  useEffect(() => {
    if (audioMuted !== null) {
      toggleAudio();
      emitAVSettingsChange();
      soundMonitor.setAudioMuted(audioMuted);
    }
  }, [audioMuted]);

  useEffect(() => {
    if (videoMuted !== null) {
      toggleVideo();
      emitAVSettingsChange();
    }
  }, [videoMuted]);

  const handleMessageArrived = (event) => {
    if (step === Steps.SESSION && event.message && event.message.length > 0) {
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
      if (audioTrack) {
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

  const cancelRequestCall = (requestedUser) => {
    socketManager.emitEvent(MessageType.CANCEL_CALL, {
      userId: requestedUser.userId,
      userDescription: requestedUser.name,
      callerId: appManager.getUserDetails().userId,
      callerDescription: appManager.getUserDetails().name,
      meetingId: selectedMeeting.id
    }).catch((error) => {
    });
  };

  const handleEndCall = async () => {
    if (screenShared) {
      if (currentUserStream.shareScreenObj.getVideoTracks().length > 0) {
        currentUserStream.shareScreenObj.getVideoTracks()[0].enabled = false;
        currentUserStream.shareScreenObj.getVideoTracks()[0].stop();

        peerManager.userPeerMap.forEach((peerObj) => {
          if (peerObj.peer.connected) {
            try {
              peerObj.peer.removeTrack(
                currentUserStream.shareScreenObj.getVideoTracks()[0], // prev video track - webcam
                currentUserStream.shareScreenObj
              );
            } catch (e) {
              console.log(e);
            }
          }
        });

        currentUserStream.shareScreenObj.removeTrack(currentUserStream.shareScreenObj.getVideoTracks()[0]);
      }

      emitSystemEvent("SHARE_SCREEN", {
        shared: false,
        userId: appManager.getUserDetails().userId
      });
    }

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
    <Fragment>
      <div style={{display: 'none'}}>
        <video
          hidden={false} muted
          playsInline autoPlay ref={recordRef}
          style={{width: '200px', height: '200px'}}
        />
      </div>
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
          <div style={{height: '100%', maxHeight: '100%', backgroundColor: '#000000'}}>
            <div className={displayState === 'MAXIMIZED' ? 'workspace-max' : 'workspace-min'}>
              <div className={'row no-margin no-padding'}
                   style={{width: '100%', height: '100%', display: displayState === 'MAXIMIZED' ? 'inherit' : 'none'}}>
                {
                  showWhiteBoard && meetingParticipantGridMode === 'STRIP' &&
                  <div className={'row no-margin no-padding'}
                       style={{width: '100%', height: 'calc(100% - 156px)', margin: '16px 0'}}>
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
                          },
                          onSystemEvent: (eventType, data) => {
                            emitSystemEvent(eventType, data);
                          }
                        }
                      }/>
                    </div>
                  </div>
                }
                {
                  <div style={{
                    padding: (screenShared && shareScreenSource.current && shareScreenSource.current.name.toLowerCase() !== 'entire screen'
                      && shareScreenSource.current.name.toLowerCase() !== 'armscor connect') || someoneSharing ? '16px 16px 0 16px' : null,
                    width: (screenShared && shareScreenSource.current && shareScreenSource.current.name.toLowerCase() !== 'entire screen'
                      && shareScreenSource.current.name.toLowerCase() !== 'armscor connect') || someoneSharing ? '100%' : '0',
                    height: (screenShared && shareScreenSource.current && shareScreenSource.current.name.toLowerCase() !== 'entire screen'
                      && shareScreenSource.current.name.toLowerCase() !== 'armscor connect') || someoneSharing ? 'calc(100% - 200px)' : '0'
                  }}>
                    <div style={{color: '#ffffff', fontSize: '20px', padding: '8px'}}>
                      {
                        someoneSharing &&
                        <span>
                            {
                              participants.find((p) => p.userId === someoneSharing)?.name + ' is sharing'
                            }
                          </span>
                      }
                    </div>
                    <video
                      hidden={false}
                      muted playsinline autoPlay ref={shareScreenRef}
                      style={{width: '100%', height: '100%', borderRadius: '4px'}}
                    />
                  </div>
                }
                <div className={'row'} style={{
                  width: 'calc(100% - 32px)',
                  height: meetingParticipantGridMode === 'DEFAULT' ? 'calc(100% - 32px)' : null,
                  marginLeft: '0',
                  marginRight: '0',
                  margin: '16px'
                }}>
                  <div className={'col'} style={{width: '100%', paddingLeft: '0', paddingRight: '0'}}>
                    {
                      step === Steps.SYSTEM_ERROR ?
                        <div style={{
                          backgroundColor: 'rgb(40, 40, 43)',
                          color: 'rgb(235, 63, 33)',
                          fontSize: '24px',
                          width: '100%',
                          height: '100%'
                        }} className={'centered-flex-box'}>
                          {SYSTEM_ERROR_MESSAGE}
                        </div>
                        :
                        step === Steps.CONNECTION_ERROR ?
                          <div style={{
                            backgroundColor: 'rgb(40, 40, 43)',
                            color: 'rgb(235, 63, 33)',
                            fontSize: '24px',
                            width: '100%',
                            height: '100%'
                          }} className={'centered-flex-box'}>
                            <div>
                              {/*<LottieIcon id={'waiting'}/>*/}
                              {CONNECTION_ERROR_MESSAGE}
                            </div>
                          </div>
                          :
                          step === Steps.STREAM_ERROR ?
                            <div style={{
                              backgroundColor: 'rgb(40, 40, 43)',
                              color: 'rgb(235, 63, 33)',
                              fontSize: '24px',
                              width: '100%',
                              height: '100%'
                            }} className={'centered-flex-box'}>
                              <div>
                                {/*<LottieIcon id={'waiting'}/>*/}
                                {STREAM_ERROR_MESSAGE}
                              </div>
                            </div>
                            :
                            <>
                              <MeetingParticipantGrid participants={participants}
                                                      waitingList={lobbyWaitingList}
                                                      mode={meetingParticipantGridMode}
                                                      audioMuted={audioMuted}
                                                      videoMuted={videoMuted}
                                                      meetingTitle={selectedMeeting.title}
                                                      userToCall={userToCall}
                                                      userStream={currentUserStream.obj}
                                                      pinnedParticipant={pinnedParticipant}
                                                      step={step}
                                                      isHost={isHost}
                                                      autoPermit={autoPermit}
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
                            </>
                    }
                  </div>
                </div>
              </div>
              <div style={{display: displayState === 'MINIMIZED' ? 'inherit' : 'none'}}>
                <MeetingRoomSummary participants={participants}/>
              </div>
            </div>
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
      {
        currentUserStream &&
        <div className={'footer-container'}>
          <Footer audioMuted={audioMuted}
                  hasUnreadChats={hasUnreadChats}
                  hasUnseenWhiteboardEvent={hasUnseenWhiteboardEvent}
                  participants={participants}
                  videoDisabled={videoDisabled}
                  videoMuted={videoMuted}
                  userStream={currentUserStream.obj}
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
      <div style={{
        padding: '0 32px 0 32px',
        maxHeight: '64px',
        bottom: '72px',
        right: '16px',
        minWidth: '320px',
        zIndex: '1200',
        position: 'absolute'
      }}>
        {screenShared && shareScreenSource.current
        && (shareScreenSource.current.name.toLowerCase() === 'entire screen' || shareScreenSource.current.name.toLowerCase() === 'armscor connect') && (
          <Alert style={{marginBottom: '16px', marginTop: '-120px'}} severity="error">
            {
              (shareScreenSource.current.name.toLowerCase() === 'entire screen' ? 'Your entire screen' : 'The ' + shareScreenSource.current.name + ' window')
              + ' is being shared with other participants'
            }
          </Alert>
        )}
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
