/* eslint-disable */

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

import './Call.css';
import { MessageType } from '../../types';

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Call = () => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = '3553846c-26ca-4aa9-b346-0d2ab85de97a';

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:8000');
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        // @ts-ignore
        userVideo.current.srcObject = stream;
        // @ts-ignore
        socketRef.current.emit(MessageType.JOIN_MEETING, roomID);
        // @ts-ignore
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

export default Call;
