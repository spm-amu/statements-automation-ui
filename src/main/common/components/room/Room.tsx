import React, { useState, useRef, useEffect, useCallback } from 'react';
import Video from '../video';
import { MessageType, WebRTCUser, WebsocketMessage } from '../../types';

const pc_config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

const Room = () => {
  const socketRef = useRef<WebSocket>();
  const pcsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();
  const [meetingId, setMeetingId] = useState('')
  const [users, setUsers] = useState<WebRTCUser[]>([]);

  const socket = new WebSocket("ws://54.204.92.217:8080/signal");

  const sendToServer = (msg: WebsocketMessage) => {
    let msgJSON = JSON.stringify(msg);
    socket.send(msgJSON);
  }

  const getLocalStream = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 240,
          height: 240,
        },
      });
      localStreamRef.current = localStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      if (!socketRef.current) return;

      const message = {
        from: 'GabrielleRobertson',
        type: MessageType.JOIN,
        room: meetingId,
      }

      sendToServer(message);
    } catch (e) {
      console.log(`getUserMedia error: ${e}`);
    }
  }, []);


  const createPeerConnection = useCallback((socketID: string, email: string) => {
    try {
      const pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (e) => {
        if (!(socketRef.current && e.candidate)) return;
        console.log('onicecandidate');

        const message = {
          from: socketID,
          type: MessageType.ICE,
          candidate: e.candidate,
          room: meetingId
        }

        sendToServer(message);
      };

      pc.oniceconnectionstatechange = (e) => {
        console.log(e);
      };

      console.log('!!!!!!!!!', pc);
      pc.ontrack = (e) => {
        console.log('%%%%%%%', e);
        console.log('ontrack success');
        setUsers((oldUsers) =>
          oldUsers
            .filter((user) => user.id !== socketID)
            .concat({
              id: socketID,
              email,
              stream: e.streams[0],
            }),
        );
      };

      if (localStreamRef.current) {
        console.log('localstream add');
        localStreamRef.current.getTracks().forEach((track) => {
          if (!localStreamRef.current) return;

          console.log('*********', localStreamRef.current);
          pc.addTrack(track, localStreamRef.current);
        });
      } else {
        console.log('no local stream');
      }

      return pc;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, []);

  useEffect(() => {

    socketRef.current = socket;

    console.log('socketRef.current 2: ', socketRef.current);

    getLocalStream();

    socket.onmessage = async function(msg) {
      let message = JSON.parse(msg.data);

      const { type, from, sdp, usersInTheMeeting, candidate, email } = message;

      console.log('####################', message);

      switch (type) {
        case MessageType.ALL_USERS:
          console.log('@@@@@@@@@@@@@@@@@: ', message);
          for (const user of usersInTheMeeting) {
            if (!localStreamRef.current) continue;
            const pcUser = createPeerConnection(user.id, user.email);
            if (!(pcUser && socketRef.current)) continue;
            pcsRef.current = { ...pcsRef.current, [user.id]: pcUser };
            try {
              const localSdp = await pcUser.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });
              console.log('create offer success');
              await pcUser.setLocalDescription(new RTCSessionDescription(localSdp));

              const message = {
                from: user.id,
                type: MessageType.OFFER,
                sdp: pcUser.localDescription,
                room: meetingId,
              }

              sendToServer(message);
            } catch (e) {
              console.error(e);
            }
          }
          break;

        case MessageType.OFFER:
          console.log('Signal OFFER received');
          console.log('get offer');
          if (!localStreamRef.current) return;
          const pcOffer = createPeerConnection(from, email);
          if (!(pcOffer && socketRef.current)) return;
          pcsRef.current = { ...pcsRef.current, [from]: pcOffer };
          try {
            await pcOffer.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log('answer set remote description success');
            const localSdp = await pcOffer.createAnswer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true,
            });
            await pcOffer.setLocalDescription(new RTCSessionDescription(localSdp));

            const message = {
              from: from,
              type: MessageType.ANSWER,
              sdp: pcOffer.localDescription,
              room: meetingId,
            }

            sendToServer(message);
          } catch (e) {
            console.error(e);
          }
          break;

        case MessageType.ANSWER:
          console.log('Signal ANSWER received');
          const pcAnswer: RTCPeerConnection = pcsRef.current[from];
          if (!pcAnswer) return;
          pcAnswer.setRemoteDescription(new RTCSessionDescription(sdp));
          break;

        case "ice":
          console.log('Signal ICE received');
          const pcIce: RTCPeerConnection = pcsRef.current[from];
          if (!pcIce) return;
          await pcIce.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('candidate add success');
          break;

        case MessageType.LEAVE:
          console.log('Signal LEAVE received');
          if (!pcsRef.current[from]) return;
          pcsRef.current[from].close();
          delete pcsRef.current[from];
          setUsers((oldUsers) => oldUsers.filter((user) => user.id !== from));
          break;
      }
    }

    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current?.onclose = function(message) {
    //       console.log('Socket has been closed');
    //     };
    //   }
    //
    //   users.forEach((user) => {
    //     if (!pcsRef.current[user.id]) return;
    //     pcsRef.current[user.id].close();
    //     delete pcsRef.current[user.id];
    //   });
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPeerConnection, getLocalStream]);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      {users.map((user, index) => (
        <Video key={index} email={user.email} stream={user.stream} />
      ))}
    </div>
  );
};

export default Room;
