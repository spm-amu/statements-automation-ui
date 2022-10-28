import React, {useEffect, useRef, useState} from 'react';

import './Calendar.css';
import './MeetingRoom.css';
import {useNavigate} from 'react-router-dom';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import withStyles from "@material-ui/core/styles/withStyles";
import Icon from '../Icon';
import Paper from "@material-ui/core/Paper";
import IconButton from '@material-ui/core/IconButton';
import Draggable from "react-draggable";
import Lobby from "../vc/Lobby";
import Footer from "../vc/Footer";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import Utils from "../../Utils";
import MeetingParticipantGrid from '../vc/MeetingParticipantGrid';

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
    handle="#meeting-window-title"
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

  const handler = () => {
    return {
      get id() {
        return 'meeting-room-' + selectedMeeting.id;
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
            console.log("\n\n\nCALL ENDED : ", socketManager.userPeerMap);
            onCallEnded();
            break;
        }
      }
    }
  };

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [windowTransformValue, setWindowTransformValue] = useState(null);
  const [displayState, setDisplayState] = useState('MAXIMIZED');
  const [participants, setParticipants] = useState([]);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [step, setStep] = useState('LOBBY');
  const [currentUserStream, setCurrentUserStream] = useState(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const userVideo = useRef();
  const navigate = useNavigate();
  const eventHandler = {
    api: handler()
  };

  const {
    selectedMeeting,
    isHost,
    userToCall,
    isDirectCall
  } = props;

  const removeUser = (user) => {
    socketManager.removeFromUserToPeerMap(user.id);

    const userId = user.id;
    const alias = user.alias;
    const peerObj = participants.find((p) => p.peerID === userId);
    const newParticipants = participants.filter((p) => !Utils.isNull(p.peer) && p.peer.peerID !== userId);

    setParticipants(newParticipants);
    if (newParticipants.length === 0) {
      onCallEnded();
      props.closeHandler();
    }
  };

  const addUser = (payload) => {
    let userToPeerItem = socketManager.mapUserToPeer(payload, currentUserStream, MessageType.USER_JOINED);
    joinInAudio.play();

    let user = {
      peerID: userToPeerItem.user.callerID,
      peer: userToPeerItem.peer,
      name: userToPeerItem.user.name,
      avatar: userToPeerItem.user.avatar
    };

    userToPeerItem.peer.on('stream', (stream) => {
      user.stream = stream;
      setParticipants((participants) => [...participants, user]);
      if (step === Steps.LOBBY) {
        setStep(Steps.SESSION);
      }
    });

    userToPeerItem.peer.signal(payload.signal);
  };

  const createParticipants = (users, socket) => {
    socketManager.clearUserToPeerMap();

    let userPeerMap = [];
    users.forEach((user) => {
      userPeerMap.push(socketManager.mapUserToPeer(user, currentUserStream, MessageType.ALL_USERS))
    });

    let participants = [];
    for (const mapItem of userPeerMap) {
      let user = {
        peer: mapItem.peer,
        name: mapItem.user.name,
        avatar: mapItem.user.avatar,
      };

      mapItem.peer.on('stream', (stream) => {
        user.stream = stream;
        participants.push(user);

        if (participants.length === userPeerMap.length) {
          if (!isHost) {
            setParticipants(participants);
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
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const userAlias = userDetails.userId;
    socketManager.emitEvent(MessageType.PERMISSION, {
      user: userAlias,
      room: selectedMeeting.id,
      email: userDetails.emailAddress,
    });
  };

  const join = () => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    socketManager.emitEvent(MessageType.JOIN_MEETING, {
      room: selectedMeeting.id,
      userIdentity: userDetails.userId,
      name: userDetails.name,
      avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      email: userDetails.emailAddress,
      isHost: isHost
    });
  };

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    return () => {
      endCall();
      socketManager.removeSubscriptions(socketEventHandler);
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
    };
  }, []);

  useEffect(() => {
    if (currentUserStream) {
      socketManager.addSubscriptions(eventHandler, MessageType.PERMIT, MessageType.ALLOWED, MessageType.USER_JOINED, MessageType.USER_LEFT,
        MessageType.ALL_USERS, MessageType.RECEIVING_RETURNED_SIGNAL, MessageType.CALL_ENDED);

      if (isHost || isDirectCall) {
        join();
      } else {
        askForPermission();
      }
    }
  }, [currentUserStream]);

  const {settings} = props;

  useEffect(() => {
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
  }, [userVideo.current, currentUserStream]);

  useEffect(() => {
    if (step === Steps.SESSION) {
      minimizeView(null);
    } else if (props.viewSwitch > 0) {
      endCall();
    }
  }, [props.viewSwitch]);

  const handleSidebarToggle = (e) => {
    let paper = document.getElementById('meetingDialogPaper');
    if (e.detail.open) {
      paper.style.margin = '136px 0 0 144px';
    } else {
      paper.style.margin = '136px 0 0 0';
    }
  };

  const endCall = () => {
    if (currentUserStream) {
      socketManager.endCall();
    }
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
    props.closeHandler();
    navigate("/view/calendar");
  };

  const minimizeView = (e) => {
    let paper = document.getElementById('meetingDialogPaper');

    if (paper) {
      paper.parentElement.style.display = 'flex';
      paper.parentElement.style.alignItems = 'flex-end';
      paper.parentElement.style.justifyContent = 'flex-end';

      if (windowTransformValue) {
        paper.style.transform = windowTransformValue;
      }

      paper.style.width = '700px';
      paper.style.height = '350px';
      paper.style.margin = '0 16px 16px 16px';

      document.getElementById('meeting-window-title').style.cursor = 'move';
      setDisplayState('MINIMIZED');
    }
  };

  const maximizeView = (e) => {
    let paper = document.getElementById('meetingDialogPaper');

    if (paper) {
      let sidebar = document.getElementsByClassName('sidebar')[0];
      let sidebarTransform = window.getComputedStyle(sidebar, null).transform;
      let isSidebarHidden = sidebarTransform && sidebarTransform.includes('-144');

      setWindowTransformValue(paper.style.transform);
      paper.style.transform = 'translate(0, 0)';

      paper.style.width = '100%';
      paper.style.height = '100%';
      paper.style.margin = isSidebarHidden ? '136px 0 0 0' : '136px 0 0 144px';

      document.getElementById('meeting-window-title').style.cursor = 'default';
      setDisplayState('MAXIMIZED');
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
      id: item.socketId
    });

    removeFromLobbyWaiting(item);
  };

  return (
    <div style={{width: '100%', height: '100%'}}>
      <StyledDialog
        open={true}
        onClose={(e) => {
        }}
        keepMounted
        hideBackdrop={true}
        aria-labelledby="meeting-window-title"
        aria-describedby="meeting-window-description"
        PaperComponent={PaperComponent}
        PaperProps={{id: 'meetingDialogPaper', disabled: displayState === 'MAXIMIZED'}}
      >
        <DialogTitle id="meeting-window-title">
          {
            step === Steps.SESSION &&
            <div className={'dialogHeader'}>
              {
                displayState === 'MAXIMIZED' ?
                  <IconButton
                    onClick={(e) => {
                      minimizeView(e)
                    }}
                    style={{
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'MINIMIZE'}/>
                  </IconButton>
                  :
                  <IconButton
                    onClick={(e) => {
                      maximizeView(e)
                    }}
                    style={{
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'MAXIMIZE'}/>
                  </IconButton>
              }
            </div>
          }
        </DialogTitle>
        <DialogContent className={'row-*-* meeting-window-container'}>
          <div style={{height: 'calc(100% - 144px)'}}>
            {
              step === Steps.LOBBY || (lobbyWaitingList && lobbyWaitingList.length > 0) ?
                <Lobby userToCall={userToCall} isHost={isHost} waitingList={lobbyWaitingList}
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
                <MeetingParticipantGrid participants={participants} videoMuted={videoMuted}/>
            }
            {
              currentUserStream &&
              <Footer userVideo={userVideo}
                      userStream={currentUserStream}
                      audioMuted={audioMuted}
                      videoMuted={videoMuted}
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
                              socketManager.emitEvent(MessageType.CANCEL_CALL, {userId: userToCall.userId});
                              onCallEnded();
                            } else {
                              endCall();
                            }
                          },
                          shareScreen: () => {
                          },
                          stopShareScreen: () => {
                          },
                          showPeople: () => {
                          },
                          showChat: () => {
                          }
                        }
                      }
              />
            }
          </div>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default MeetingRoom;

