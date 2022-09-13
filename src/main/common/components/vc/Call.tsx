import { useEffect, useRef, useState } from 'react';
import './Call.css';
import Peer from 'simple-peer';
import { MessageType, WebsocketMessage } from '../../types';

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2
};

const socket = new WebSocket("ws://localhost:8090/signal");

const Call = () => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef<WebSocket>();
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef([]);

  const loggedInUserName = sessionStorage.getItem('username');

  const roomID = '3553846c-26ca-4aa9-b346-0d2ab85de97a';

  useEffect(() => {
    socketRef.current = socket;
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
      userVideo.current!.srcObject = stream;

      sendToServer({
        client: {
          userId: loggedInUserName
        },
        type: MessageType.JOIN,
        meetingRoomId: roomID
      });

      socket.onmessage = function(msg) {
        console.log('ON MESSAGE: ', msg)
        const message = JSON.parse(msg.data);

        switch (message.type) {
          case MessageType.ALL_USERS:
            const peers = [];
            message.clientsJoined.forEach(client => {
              const peer = createPeer(client.userId, client.sessionId, stream, message);
              // @ts-ignore
              peersRef.current.push({
                peerID: client.sessionId,
                peer,
              })
              peers.push(peer);
            });
            setPeers(peers);
            break;

          case MessageType.USER_JOINED:
            const peer = addPeer(message.peerSignal.signal, message.peerSignal.callerId, stream, message);
            // @ts-ignore
            peersRef.current.push({
              peerID: message.peerSignal.callerId,
              peer,
            })

            // @ts-ignore
            setPeers(users => [...users, peer]);
            break

          case MessageType.RECEIVING_RETURNED_SIGNAL:
            const item = peersRef.current.find(p => p.peerID === message.peerSignal.callerId);
            item.peer.signal(message.peerSignal.signal);
            break;
        }
      }
    })
  }, []);

  // @ts-ignore
  const createPeer = (userToSignal, callerID, stream, message) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    if (userToSignal !== loggedInUserName) {
      peer.on("signal", signal => {
        sendToServer({
          type: MessageType.SENDING_SIGNAL,
          client: message.client,
          meetingRoomId: message.meetingRoomId,
          clientsJoined: message.clientsJoined,
          peerSignal: {
            userToSignal,
            callerId: callerID,
            signal
          }
        })
      })
    }

    return peer;
  }


  function addPeer(incomingSignal, callerID, stream, message) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    if (message.client.sessionId !== callerID) {
      peer.on("signal", signal => {
        sendToServer({
          type: MessageType.RETURNING_SIGNAL,
          client: message.client,
          meetingRoomId: message.meetingRoomId,
          clientsJoined: message.clientsJoined,
          peerSignal: {
            incomingSignal,
            callerId: callerID,
            signal
          }
        })
      })

      console.log('incomingSignal: ', incomingSignal);

      peer.signal(incomingSignal);
    }

    return peer;
  }

  const sendToServer = (message: WebsocketMessage) => {
    let msgJSON = JSON.stringify(message);
    socket.send(msgJSON);
  }

  const Video = (props) => {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [remoteStream, setRemoteStream] = useState(null);


    useEffect(() => {
      props.peer.on("stream", stream => {
        setRemoteStream(stream);
      })
    }, []);

    useEffect(() => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    return (
      <video className="call-video" playsInline autoPlay ref={remoteVideoRef} />
    );
  }

  return (
    <div className="call-container">
      <video className="call-video" muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => {
        return (
          <Video key={index} peer={peer} />
        );
      })}
    </div>
  );
};

export default Call;
