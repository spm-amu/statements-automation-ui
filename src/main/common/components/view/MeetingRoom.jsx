import React, {useState} from 'react';
import { useEffect, useRef } from '@types/react';
import io from 'socket.io-client';
import { MessageType } from '../../types';

import './Calendar.css';
import Peer from 'simple-peer';

const MeetingRoom = (props) => {
  const {selectedMeeting} = props;
  const {settings} = props;

  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:8000');
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit(MessageType.JOIN_MEETING, selectedMeeting.id);
        socketRef.current.on(MessageType.ALL_USERS, (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on(MessageType.USER_JOINED, (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on(MessageType.RECEIVING_RETURNED_SIGNAL, (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
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

  const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
      props.peer.on('stream', (stream) => {
        ref.current.srcObject = stream;
      });
    }, []);

    return <video className="call-video" playsInline autoPlay ref={ref} />;
  };

  return (
    <div className="call-container">
      <video
        className="call-video"
        muted
        ref={userVideo}
        autoPlay
        playsInline
      />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}
    </div>
  );
};

export default MeetingRoom;
