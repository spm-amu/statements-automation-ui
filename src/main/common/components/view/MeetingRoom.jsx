import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageType } from '../../types';

import './Calendar.css';
import './MeetingRoom.css';
import AlertDialog from '../AlertDialog';
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  GridList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@material-ui/core";

import PartnerVideo from '../PartnerVideo';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import MyToolTip from '../MyToolTip';
import Icon from '../Icon';
import Peer from 'simple-peer';
import MeetingParticipant from "../vc/MeetingParticipant";
import MeetingParticipantGrid from "../vc/MeetingParticipantGrid";

const MeetingRoom = (props) => {

  const { selectedMeeting, isHost } = props;

  const {settings} = props;

  // const [participantsDemo, setParticipantsDemo] = useState([
  //   {
  //     peer: null,
  //     name: 'Amukelani Shandli',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png')
  //   },
  //   {
  //     peer: null,
  //     name: 'Nsovo Ngobz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png')
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png')
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png')
  //   },
  //   {
  //     peer: null,
  //     name: 'Peter Ngulz',
  //     avatar: require('../../../desktop/dashboard/images/noimage-person.png')
  //   }
  // ]);

  const [popUp, setPopUp] = useState("");
  const [participants, setParticipants] = useState([]);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const userStream = useRef();
  const joiningSocket = useRef();
  const socketRef = useRef();
  const userVideo = useRef();
  const audioTrack = useRef();
  const videoTrack = useRef();
  const tmpTrack = useRef();
  const screenTrack = useRef();
  const peersRef = useRef([]);

  window.onpopstate = () => {
    if (userStream.current)
      userStream.current.getTracks().forEach((track) => track.stop());
    socketRef.current.disconnect();
    window.location.reload();
  };

  const joinPersonIn = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((myStream) => {
        setLoading(false);

        userStream.current = myStream;
        videoTrack.current = userStream.current.getTracks()[1];
        audioTrack.current = userStream.current.getTracks()[0];

        userVideo.current.srcObject = myStream

        let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

        socketRef.current.emit(MessageType.JOIN_MEETING, {
          room: selectedMeeting.id,
          userIdentity: userDetails.userId,
          name: userDetails.name,
          avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
          email: userDetails.emailAddress,
          isHost
        });

        socketRef.current.on(MessageType.PERMIT, ( payload ) => {
          const userAlias = payload.userAlias;
          joiningSocket.current = payload.id;
          setPopUp(`1 ${userAlias}`);
          // identify popup using popup[0] = 1
        });

        socketRef.current.on(MessageType.ALL_USERS, ( users ) => {
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
              avatar: user.avatar
            });
          });

          setParticipants(peers);
        });

        socketRef.current.on(MessageType.USER_JOINED, (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, myStream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          const user = {
            peer: peer,
            name: payload.name,
            avatar: payload.avatar
          }

          setParticipants((users) => [...users, user]);
        });

        socketRef.current.on(MessageType.RECEIVING_RETURNED_SIGNAL, (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  };

  useEffect(() => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    socketRef.current = io.connect('http://localhost:8000');

    setLoading(true);

    if (!isHost) {
      setPopUp("Waiting");

      console.log('userDetails: ', userDetails)

      const userAlias = userDetails.userId;

      socketRef.current.emit(MessageType.PERMISSION, {
        user: userAlias,
        room: selectedMeeting.id,
        email: userDetails.emailAddress,
      });

      socketRef.current.on(MessageType.NO_PERMIT_REQUIRED, () => {
        joinPersonIn();
      });

      socketRef.current.on(MessageType.ALLOWED, ( chatId ) => {
        joinPersonIn();
      });

      socketRef.current.on(MessageType.DENIED, () => {
        setTimeout(() => {
          // errorAudio.play();
          setPopUp("denied to join");
        }, 1000);
      });
    } else {
      joinPersonIn();
    }
  }, []);

  const endCall = () => {
    // play the call ending sound
    // hangUpAudio.play();

    // stop all tracks - audio and video
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
    }
    socketRef.current.disconnect();
  };

  const muteVideo = () => {
    if (userVideo.current.srcObject) {
      if (!screenShared) {
        videoTrack.current.enabled = !videoTrack.current.enabled;
      }
    }
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const muteAudio = () => {
    if (userVideo.current.srcObject) {
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
        avatar: require('../../../desktop/dashboard/images/noimage-person.png')
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
      socketRef.current.emit(MessageType.RETURNING_SIGNAL, { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
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

    // restore the videoTrack which was stored earlier in tmpTrack when screensharing was turned on
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

  return (
    <div className={'grid-container'}>
      {popUp[0] === "1" && (
        <AlertDialog
          title="Join request!"
          message={`${popUp.substr(2)} is requesting to join the call.`}
          showLeft={true}
          showRight={true}
          auto={false}
          btnTextLeft={"Deny Entry"}
          btnTextRight={"Admit"}
          // onClose equivalent to deny
          onClose={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: false,
              id: joiningSocket.current,
            });
            setPopUp("");
          }}
          onLeft={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: false,
              id: joiningSocket.current,
            });
            setPopUp("");
          }}
          onRight={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: true,
              id: joiningSocket.current,
            });
            setPopUp("");
          }}
        />
      )}

      { loading && popUp === "Waiting" && (
        <AlertDialog
          title={ <CircularProgress color="secondary" /> }
          message="Waiting for the meeting host to let you in."
          showLeft={false}
          showRight={false}
          auto={false}
          keepOpen={true}
          onClose={() => { }}
        />
      )}

      {
        participants.length > 0 && <MeetingParticipantGrid participants={participants} />
      }

      <footer className="call--overlay--footer">
        <section className="call--overlay--footer--yourself">
          <video
            ref={userVideo}
            className="call--overlay--footer--yourself--media"
            autoPlay
            playsInline
            controls
            muted={true}
          />
        </section>
      </footer>

    </div>
  );
};

export default MeetingRoom;
