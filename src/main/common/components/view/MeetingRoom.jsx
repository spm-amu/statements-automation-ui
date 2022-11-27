import React, {useEffect, useRef, useState} from 'react';

import './Calendar.css';
import './MeetingRoom.css';
import Dialog from "@material-ui/core/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import Lobby from "../vc/Lobby";
import Footer from "../vc/Footer";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import Utils from "../../Utils";
import MeetingParticipantGrid from '../vc/MeetingParticipantGrid';
import ClosablePanel from "../layout/ClosablePanel";
import MeetingRoomSideBarContent from "../vc/MeetingRoomSideBarContent";
import appManager from "../../../common/service/AppManager";
import MeetingRoomSummary from "../vc/MeetingRoomSummary";
import { get, host, post } from '../../service/RestService';

const StyledDialog = withStyles({
  root: {pointerEvents: "none"},
  paper: {
    pointerEvents: 'auto',
    width: '100%',
    height: '100%',
    maxWidth: 'calc(100% - 144px)',
    maxHeight: 'calc(100% - 136px)',
    margin: '136px 0 0 144px',
    padding: '0',
    overflow: 'hidden',
    boxShadow: 'none !important',
    ['@media (max-width:800px)']: {
      margin: '136px 0 0 0',
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
  SESSION: 'SESSION'
};

const hangUpAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/hangupsound.mp3');
const joinInAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/joinsound.mp3');
const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');
const errorAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/error.mp3');
const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

const MeetingRoom = (props) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarTab, setSideBarTab] = useState('');
  const [displayState, setDisplayState] = useState(props.displayState);
  const [participants, setParticipants] = useState([]);
  const [meetingChat, setMeetingChat] = useState(null);
  const [participantsRaisedHands, setParticipantsRaisedHands] = useState([]);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [step, setStep] = useState('LOBBY');
  const [currentUserStream, setCurrentUserStream] = useState(null);
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [handRaised, setHandRaised] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [allUserParticipantsLeft, setAllUserParticipantsLeft] = useState(false);
  const [eventHandler] = useState({});
  const userVideo = useRef();

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
        }
      }
    }
  };

  const {
    selectedMeeting,
    isHost,
    userToCall,
    isDirectCall
  } = props;

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
    if(selectedMeeting.id === user.meetingId) {
      socketManager.removeFromUserToPeerMap(user.id);

      const userId = user.alias;
      const peerObj = participants.find((p) => p.peerID === user.id);
      const newParticipants = participants.filter((p) => p.userId !== userId);

      setParticipants(newParticipants);
      if (newParticipants.length === 0) {
        //onCallEnded();
        //props.closeHandler();
        setAllUserParticipantsLeft(true);
      }
    }
  };

  useEffect(() => {
    if (displayState) {
      setDisplayState(props.displayState);
    }
  }, [props.displayState]);

  useEffect(() => {
    if (allUserParticipantsLeft) {
      if(!isDirectCall) {
        // TODO : Introduce a new step for this
        setStep("LOBBY");
      } else {
        endCall();
        onCallEnded();
      }
    }
  }, [allUserParticipantsLeft]);

  const addUser = (payload) => {
    let userToPeerItem = socketManager.mapUserToPeer(payload, currentUserStream, MessageType.USER_JOINED);
    joinInAudio.play();

    let user = {
      peerID: userToPeerItem.user.callerID,
      userId: userToPeerItem.user.userAlias,
      peer: userToPeerItem.peer,
      name: userToPeerItem.user.name,
      avatar: userToPeerItem.user.avatar,
      audioMuted: payload.audioMuted,
      videoMuted: payload.videoMuted
    };

    userToPeerItem.peer.on('stream', (stream) => {
      user.stream = stream;
      console.log("UPDATING PARTICIPANTS");
      setParticipants((participants) => [...participants, user]);
      setAllUserParticipantsLeft(false);
      if (step === Steps.LOBBY) {
        setStep(Steps.SESSION);
      }
    });

    userToPeerItem.peer.signal(payload.signal);
  };

  const createParticipants = (users, socket) => {
    socketManager.clearUserToPeerMap();

    if (isHost && users.length > 0) {
      // If this condition is true, then the host is re-joining the session
      // TODO : Implement host re-join
    } else {
      let userPeerMap = [];
      users.forEach((user) => {
        userPeerMap.push(socketManager.mapUserToPeer(user, currentUserStream, MessageType.ALL_USERS))
      });

      let participants = [];
      for (const mapItem of userPeerMap) {
        let user = {
          userId: mapItem.user.userAlias,
          peer: mapItem.peer,
          name: mapItem.user.name,
          avatar: mapItem.user.avatar,
          audioMuted: mapItem.user.audioMuted,
          videoMuted: mapItem.user.videoMuted
        };

        mapItem.peer.on('stream', (stream) => {
          user.stream = stream;
          participants.push(user);

          if (participants.length === userPeerMap.length) {
            if (!isHost) {
              setParticipants(participants);
              setAllUserParticipantsLeft(false);

              if (userPeerMap.length > 0) {
                if (step === Steps.LOBBY) {
                  setStep(Steps.SESSION);
                }
              }
            } else {
              setLobbyWaitingList(participants);
            }
          }
        });
      }
    }
  };

  const addUserToLobby = (data) => {
    permitAudio.play();
    let item = {
      user: data.userAlias,
      socketId: data.id
    };

    setLobbyWaitingList(lobbyWaitingList.concat([item]));
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
    alert(isHost);
    socketManager.emitEvent(MessageType.JOIN_MEETING, {
      room: selectedMeeting.id,
      userIdentity: userDetails.userId,
      name: userDetails.name,
      avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      email: userDetails.emailAddress,
      isHost: isHost,
      audioMuted: audioMuted,
      videoMuted: videoMuted,
      direct: isDirectCall
    });
  };

  const requestUserToJoin = (requestedUser) => {
    let userDetails = appManager.getUserDetails();

    socketManager.emitEvent(MessageType.REQUEST_TO_JOIN, {
      roomId: selectedMeeting.id,
      callerName: userDetails.name,
      meetingJoinRequest: true,
      userToCall: requestedUser
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
    };
  }, []);

  useEffect(() => {
    if (currentUserStream) {
      socketManager.addSubscriptions(eventHandler, MessageType.PERMIT, MessageType.ALLOWED, MessageType.USER_JOINED, MessageType.USER_LEFT,
        MessageType.ALL_USERS, MessageType.RECEIVING_RETURNED_SIGNAL, MessageType.CALL_ENDED, MessageType.RAISE_HAND, MessageType.LOWER_HAND,
        MessageType.AUDIO_VISUAL_SETTINGS_CHANGED);

      if (isHost || isDirectCall) {
        join();
      } else {
        askForPermission();
      }
    } else {
      socketManager.removeSubscriptions(eventHandler);
    }
  }, [currentUserStream]);

  const {settings} = props;

  const fetchChats = () => {
    console.log('fetchMeetingChat selectedMeeting: ', selectedMeeting);

    get(`${host}/api/v1/chat/fetchMeetingChat/${selectedMeeting.id}`, (response) => {
      if (response && response.id) {
        setMeetingChat(response);
      } else {
        let chatParticipants = JSON.parse(JSON.stringify(selectedMeeting.attendees));

        chatParticipants.forEach(chatParticipant => {
          delete chatParticipant.id
        });

        let chat = {
          meetingId: selectedMeeting.id,
          title: selectedMeeting.title,
          participants: chatParticipants,
          type: 'CALENDAR_MEETING',
          messages: []
        };

        post(
          `${host}/api/v1/chat/create`,
          (chat) => {
            setMeetingChat(chat);
          },
          (e) => {},
          chat
        );
      }
    }, (e) => {

    })
  }

  useEffect(() => {
    fetchChats();

    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    navigator.mediaDevices
      .getUserMedia({video: true, audio: true})
      .then((myStream) => {
        setCurrentUserStream(myStream);
      });
  }, []);

  useEffect(() => {
    if (userVideo.current && !userVideo.current.srcObject) {
      userVideo.current.srcObject = currentUserStream;
    }

    if (currentUserStream && userVideo.current && userVideo.current.srcObject) {
      toggleAudio();
      toggleVideo();
    }
  }, [userVideo.current, currentUserStream]);

  const handleSidebarToggle = (e) => {
    let paper = document.getElementById('meetingDialogPaper');
    if (e.detail.open) {
      paper.style.margin = '136px 0 0 144px';
    } else {
      paper.style.margin = '136px 0 0 0';
    }
  };

  const onRaiseHand = (payload) => {
    const raisedHandParticipant = participants.find(p => p.userId === payload.userId);
    setParticipantsRaisedHands(oldParticipants => [...oldParticipants, raisedHandParticipant]);
  };

  const onAVSettingsChange = (payload) => {
    let participant = participants.find((p) => p.userId === payload.userId);
    if (participant) {
      participant.audioMuted = payload.audioMuted;
      participant.videoMuted = payload.videoMuted;
    }

    setParticipants([].concat(participants));
  };

  const onLowerHand = (payload) => {
    setParticipantsRaisedHands(participantsRaisedHands.filter((p) => p.userId !== payload.userId));
  };

  const endCall = () => {
    if (currentUserStream) {
      socketManager.endCall(isDirectCall);
    }

    props.onEndCall();
  };

  const onCallEnded = () => {
    if (currentUserStream) {
      hangUpAudio.play();
      currentUserStream
        .getTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop()
        });

      currentUserStream.getTracks()[1].enabled = false;
      currentUserStream.getTracks()[1].stop();

      currentUserStream.getTracks()[0].enabled = false;
      currentUserStream.getTracks()[0].stop();
    }

    socketManager.removeSubscriptions(eventHandler);
    socketManager.clearUserToPeerMap();
    socketManager.disconnectSocket();
    socketManager.init();
    props.onEndCall();
    props.closeHandler();
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
      videoMuted: videoMuted
    });
  }

  function toggleVideo() {
    if (currentUserStream) {
      let videoTrack = currentUserStream.getTracks()[1];
      if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
        if (!screenShared) {
          videoTrack.enabled = !videoMuted;
          emitAVSettingsChange();
        }
      }
    }
  }

  useEffect(() => {
    toggleVideo();
  }, [videoMuted]);

  function toggleAudio() {
    if (currentUserStream) {
      let audioTrack = currentUserStream.getTracks()[0];
      if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
        audioTrack.enabled = !audioMuted;
        emitAVSettingsChange();
      }
    }
  }

  useEffect(() => {
    toggleAudio();
  }, [audioMuted]);

  return (
    <div className={'row meeting-container'}>
      <div className={'col'} style={{paddingLeft: '0', paddingRight: '0'}}>
        <div style={{height: '100%'}}>
          <div style={{height: displayState === 'MAXIMIZED' ? 'calc(100% - 200px)' : null,
            maxHeight: displayState === 'MAXIMIZED' ? 'calc(100% - 200px)' : null, overflow: 'hidden'}}>
            {
              step === Steps.LOBBY ?
                <Lobby userToCall={userToCall} isHost={isHost} waitingList={lobbyWaitingList}
                       meetingTitle={selectedMeeting.title}
                       acceptUserHandler={
                         (item) => {
                           acceptUser(item);
                         }}
                       rejectUserHandler={
                         (item) => {
                           rejectUser(item);
                         }}
                       displayState={displayState}
                       allUserParticipantsLeft={allUserParticipantsLeft}
                />
                :
                displayState === 'MAXIMIZED' ?
                  <MeetingParticipantGrid participants={participants}
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
                  :
                  <MeetingRoomSummary participants={participants} participantsRaisedHands={participantsRaisedHands}/>
            }
          </div>
          {
            currentUserStream &&
            <Footer userVideo={userVideo}
                    userStream={currentUserStream}
                    audioMuted={audioMuted}
                    videoMuted={videoMuted}
                    handRaised={handRaised}
                    displayState={displayState}
                    step={step}
                    toolbarEventHandler={
                      {
                        onMuteVideo: (muted) => {
                          setVideoMuted(muted);
                        },
                        onMuteAudio: (muted) => {
                          setAudioMuted(muted);
                        },
                        endCall: () => {
                          if (isDirectCall && participants.length === 0) {
                            console.log("USER TO CALL : ", userToCall);
                            socketManager.emitEvent(MessageType.CANCEL_CALL, {userId: userToCall.userId, callerId: appManager.getUserDetails().userId});
                            onCallEnded();
                          } else {
                            endCall();
                            props.closeHandler();
                          }
                        },
                        shareScreen: () => {
                        },
                        stopShareScreen: () => {
                        },
                        showPeople: () => {
                          setSideBarTab('People');
                          setSideBarOpen(true);
                        },
                        showChat: () => {
                          setSideBarTab('Chat');
                          setSideBarOpen(true);
                        },
                        raiseHand: () => {
                          raiseHand();
                        },
                        lowerHand: () => {
                          lowerHand();
                        },
                      }
                    }
            />
          }
        </div>
      </div>
      {
        sideBarOpen && sideBarTab &&
        <div style={{width: '320px'}}>
          <ClosablePanel
            closeHandler={(e) => setSideBarOpen(false)}
            title={sideBarTab}
          >
            <MeetingRoomSideBarContent
              meetingChat={meetingChat}
              tab={sideBarTab}
              meetingId={selectedMeeting.id}
              participantsRaisedHands={participantsRaisedHands}
              participants={participants}
              onAudioCallHandler={(requestedUser) => requestUserToJoin(requestedUser)}
            />
          </ClosablePanel>
        </div>
      }
    </div>
  );
};

export default MeetingRoom;

