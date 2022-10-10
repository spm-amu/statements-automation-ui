import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import {MessageType} from '../../types';

import './Calendar.css';
import './MeetingRoom.css';
import Peer from 'simple-peer';
import {useNavigate} from 'react-router-dom';
import Dialog from "@material-ui/core/Dialog";
import Utils from "../../Utils";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import withStyles from "@material-ui/core/styles/withStyles";
import Icon from '../Icon';
import Paper from "@material-ui/core/Paper";
import IconButton from '@material-ui/core/IconButton';
import Draggable from "react-draggable";

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
    backgroundColor: '#a1a1a1',
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

const MeetingRoom = (props) => {
  const navigate = useNavigate();

  const {
    selectedMeeting,
    isHost,
  } = props;

  const {settings} = props;

  // const [participantsDemo, setParticipantsDemo] = useState([
  //   {
  //     peer: null,
  //     name: 'Amukelani Shandli',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Nsovo Ngobz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Nsovo Ngobz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Ada lovz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Charles B',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Bill Gates',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Mark Zucker',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   },
  //   {
  //     peer: null,
  //     name: 'Tesler',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
  //   }
  // ]);

  const hangUpAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/hangupsound.mp3');
  const joinInAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/joinsound.mp3');
  const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');
  const errorAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/error.mp3');
  const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

  const [popUp, setPopUp] = useState('');
  const [participants, setParticipants] = useState([]);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [windowTransformValue, setWindowTransformValue] = useState(null);
  const [displayState, setDisplayState] = useState('MAXIMIZED');
  const [timer, setTimer] = useState(0);

  const userStream = useRef();
  const joiningSocket = useRef();
  const socketRef = useRef();
  const userVideo = useRef();
  const audioTrack = useRef();
  const videoTrack = useRef();
  const tmpTrack = useRef();
  const screenTrack = useRef();
  const peersRef = useRef([]);
  const [currentUserStream, setCurrentUserStream] = useState(null);

  window.onpopstate = () => {
    if (userStream.current)
      userStream.current.getTracks().forEach((track) => track.stop());
    socketRef.current.disconnect();
    window.location.reload();
  };

  useEffect(() => {
    return () => {
      endCall();
      document.removeEventListener('sideBarToggleEvent', handleSidebarToggle);
    };
  }, []);

  useEffect(() => {
    minimizeView(null);
  }, [props.viewSwitch]);

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = currentUserStream;
    }
  }, [currentUserStream]);

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = currentUserStream;
    }
  }, [userVideo.current]);

  const handleSidebarToggle = (e) => {
    if (e.detail.open) {
      document.getElementById('meetingDialogPaper').style.margin = '136px 0 0 144px';
    } else {
      document.getElementById('meetingDialogPaper').style.margin = '136px 0 0 0';
    }
  };

  const joinPersonIn = () => {
    navigator.mediaDevices
      .getUserMedia({video: true, audio: true})
      .then((myStream) => {
        setLoading(false);

        userStream.current = myStream;
        videoTrack.current = userStream.current.getTracks()[1];
        audioTrack.current = userStream.current.getTracks()[0];

        setCurrentUserStream(myStream);

        if (!Utils.isNull(userVideo.current)) {
          userVideo.current.srcObject = myStream;
        }

        joinInAudio.play();
        setLoading(false);

        let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

        socketRef.current.emit(MessageType.JOIN_MEETING, {
          room: selectedMeeting.id,
          userIdentity: userDetails.userId,
          name: userDetails.name,
          avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
          email: userDetails.emailAddress,
          isHost,
        });

        socketRef.current.on(MessageType.PERMIT, (payload) => {
          permitAudio.play();

          const userAlias = payload.userAlias;
          joiningSocket.current = payload.id;
          setPopUp(`1 ${userAlias}`);
          // identify popup using popup[0] = 1
        });

        socketRef.current.on(MessageType.ALL_USERS, (users) => {
          const peers = [];
          users.forEach((user) => {
            const peer = createPeer(user.id, socketRef.current.id, myStream);
            peersRef.current.push({
              peerID: user.id,
              peer,
            });

            peers.push({
              peer: peer,
              name: user.name,
              avatar: user.avatar,
            });
          });

          setParticipants(peers);
        });

        socketRef.current.on(MessageType.USER_JOINED, (payload) => {
          joinInAudio.play();

          const peer = addPeer(payload.signal, payload.callerID, myStream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          const user = {
            peer: peer,
            name: payload.name,
            avatar: payload.avatar,
          };

          setParticipants((users) => [...users, user]);
        });

        socketRef.current.on(
          MessageType.RECEIVING_RETURNED_SIGNAL,
          (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          }
        );

        socketRef.current.on(MessageType.USER_LEFT, (payload) => {
          const userId = payload.id;
          const alias = payload.alias;
          const peerObj = peersRef.current.find((p) => p.peerID === userId);

          // if (peerObj) {
          //   // peerObj.peer.destroy(); // remove all the connections and event handlers associated with this peer
          // }

          // removing this userId from peers
          peersRef.current = peersRef.current.filter((p) => p.peerID !== userId); // update peersRef
          const newParticipants = participants.filter((p) => !Utils.isNull(p.peer) && p.peer.peerID !== userId);

          setParticipants(newParticipants);

          if (participants.length === 0) {
            endCall();
            navigate("/view/calendar");
          }

        });
      });
  };

  useEffect(() => {
    document.addEventListener("sideBarToggleEvent", handleSidebarToggle);
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    socketRef.current = io.connect('http://svn.agilemotion.co.za');

    setLoading(true);

    if (!isHost) {
      const timer = setInterval(() => {
        // waitingAudio.play();
      }, 100);

      setPopUp('Waiting');

      const userAlias = userDetails.userId;

      socketRef.current.emit(MessageType.PERMISSION, {
        user: userAlias,
        room: selectedMeeting.id,
        email: userDetails.emailAddress,
      });

      socketRef.current.on(MessageType.NO_PERMIT_REQUIRED, () => {
        // waitingAudio.pause();
        clearInterval(timer);

        joinPersonIn();
      });

      socketRef.current.on(MessageType.ALLOWED, (chatId) => {
        // waitingAudio.pause();
        clearInterval(timer);

        joinPersonIn();
      });

      socketRef.current.on(MessageType.DENIED, () => {
        // waitingAudio.pause();
        clearInterval(timer);

        setTimeout(() => {
          errorAudio.play();
          setPopUp('denied to join');
        }, 1000);
      });
    } else {
      joinPersonIn();
    }
  }, []);

  const endCall = () => {
    clearInterval(timer);
    // waitingAudio.pause();
    // play the call ending sound
    hangUpAudio.play();

    // stop all tracks - audio and video
    if (userStream.current) {
      userStream.current
        .getTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop()
        });
    }

    if (videoTrack.current) {
      videoTrack.enabled = false;
      videoTrack.current.stop();
    }

    if (audioTrack.current) {
      audioTrack.current.enabled = false;
      audioTrack.current.stop();
    }

    socketRef.current.disconnect();
    navigate("/view/calendar");
  };

  const muteVideo = () => {
    if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
      if (!screenShared) {
        videoTrack.current.enabled = !videoTrack.current.enabled;
      }
    }

    setVideoMuted((prevStatus) => !prevStatus);
  };

  const muteAudio = () => {
    if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
      audioTrack.current.enabled = !audioTrack.current.enabled;
    }
    setAudioMuted((prevStatus) => !prevStatus);
  };

  function createPeer(userToSignal, callerID, stream) {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit(MessageType.SENDING_SIGNAL, {
        userToSignal,
        callerID,
        signal,
        name: userDetails.name,
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit(MessageType.RETURNING_SIGNAL, {
        signal,
        callerID,
      });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({cursor: true}).then((stream) => {
      setScreenShared(true);

      // store the video track i.e. our web cam stream into tmpTrack
      // and replace the video track with our screen track
      // so that it will be streamed on our screen as well as to our remote peers
      userVideo.current.srcObject = stream;
      screenTrack.current = stream.getTracks()[0];
      tmpTrack.current = videoTrack.current;
      videoTrack.current = screenTrack.current;

      peersRef.current.forEach((peerObj) => {
        peerObj.peer.replaceTrack(
          tmpTrack.current, // prev video track - webcam
          videoTrack.current, // current video track - screen track
          userStream.current
        );
      });

      screenTrack.current.onended = () => {
        stopShareScreen();
      };
    });
  };

  const stopShareScreen = () => {
    setScreenShared(false);

    // restore the videoTra
    // ck which was stored earlier in tmpTrack when screensharing was turned on
    videoTrack.current = tmpTrack.current;

    // stop the screentrack
    screenTrack.current.stop();

    // reassign our stream to the prev stream i.e. to that consisting of webcam video and audio
    userVideo.current.srcObject = userStream.current;

    // replace the screenTrack with videotrack for each remote peer
    peersRef.current.forEach((peerObj) => {
      peerObj.peer.replaceTrack(
        screenTrack.current,
        videoTrack.current,
        userStream.current
      );
    });
  };

  const minimizeView = (e) => {
    let paper = document.getElementById('meetingDialogPaper');

    if(paper) {
      paper.parentElement.style.display = 'flex';
      paper.parentElement.style.alignItems = 'flex-end';
      paper.parentElement.style.justifyContent = 'flex-end';

      if(windowTransformValue) {
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

    if(paper) {
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
        </DialogTitle>
        <DialogContent className={'row meeting-window-container'}>
          <DialogContentText id="meeting-window-description">
            {'Test'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default MeetingRoom;
