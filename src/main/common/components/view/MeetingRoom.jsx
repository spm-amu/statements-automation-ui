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
import {instance as socketManager} from "../vc/SocketManager";
import {MessageType} from "../../types";
import Utils from "../../Utils";

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
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [windowTransformValue, setWindowTransformValue] = useState(null);
  const [displayState, setDisplayState] = useState('MAXIMIZED');
  const [participants, setParticipants] = useState([]);
  const [lobbyWaitingList, setLobbyWaitingList] = useState([]);
  const [step, setStep] = useState('LOBBY');
  const [currentUserSocket, setCurrentUserSocket] = useState(null);
  const [currentUserStream, setCurrentUserStream] = useState(null);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const userVideo = useRef();
  const navigate = useNavigate();
  const {
    selectedMeeting,
    isHost,
  } = props;

  useEffect(() => {
    return () => {
      endCall();
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
    };
  }, []);

  const {settings} = props;

  useEffect(() => {
    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    setCurrentUserSocket(socketManager.init(
      {
        meetingId: selectedMeeting.id,
        isHost,
        eventHandler: {
          onInit: (args) => {
            setCurrentUserSocket(args.socket);
            setCurrentUserStream(args.stream);

            joinInAudio.play();
          },
          onAskForPermision: (data) => {
            permitAudio.play();
            let item = {
              user: data.userAlias,
              socketId: data.id
            };

            setLobbyWaitingList(lobbyWaitingList.concat([item]));
          },
          onUserJoin: (userPeerItem) => {
            joinInAudio.play();

            let user = {
              peerID: userPeerItem.user.callerID,
              peer: userPeerItem.peer,
              name: userPeerItem.user.name,
              avatar: userPeerItem.user.avatar
            };

            setParticipants((participants) => [...participants, user]);

            if(step === Steps.LOBBY) {
              setStep(Steps.SESSION);
            }
          },
          onUserLeave: (user) => {

            const userId = user.id;
            const alias = user.alias;
            const peerObj = participants.find((p) => p.peerID === userId);

            // if (peerObj) {
            //   // peerObj.peer.destroy(); // remove all the connections and event handlers associated with this peer
            // }

            // removing this userId from peers
            const newParticipants = participants.filter((p) => !Utils.isNull(p.peer) && p.peer.peerID !== userId);

            setParticipants(newParticipants);
            if (participants.length === 0) {
              endCall();
              props.closeHandler();
              navigate("/view/calendar");
            }
          },
          onUsersArrived: (userPeerMap) => {
            let participants = [];
            for (const mapItem of userPeerMap) {
                participants.push({
                  peer: mapItem.peer,
                  name: mapItem.user.name,
                  avatar: mapItem.user.avatar,
                })
            }

            setParticipants(participants);
            if(userPeerMap.length > 0) {
              if (step === Steps.LOBBY) {
                setStep(Steps.SESSION);
              }
            }
          }
        }
      }
    ));
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
    hangUpAudio.play();

    if (currentUserStream) {
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

    if (currentUserSocket) {
      currentUserSocket.disconnect();
    }

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
    if (currentUserSocket) {
      currentUserSocket.emit(MessageType.PERMIT_STATUS, {
        allowed: true,
        id: item.socketId
      });
    }

    removeFromLobbyWaiting(item);
  };

  const rejectUser = (item) => {
    if (currentUserSocket) {
      currentUserSocket.emit(MessageType.PERMIT_STATUS, {
        allowed: false,
        id: item.socketId
      });
    }

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
          <div style={{height: '100%'}}>
            {
              step === Steps.LOBBY ?
                <Lobby isHost={isHost} waitingList={lobbyWaitingList}
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
                <div>SESSION - {participants.length}</div>
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
                            endCall();
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

