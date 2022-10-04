import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import {MessageType} from '../../types';

import './Calendar.css';
import './MeetingRoom.css';
import AlertDialog from '../AlertDialog';
import Peer from 'simple-peer';
import MeetingParticipantGrid from '../vc/MeetingParticipantGrid';
import MeetingParticipant from '../vc/MeetingParticipant';
import Icon from '../Icon';
import IconButton from '@material-ui/core/IconButton';
import ClosablePanel from '../layout/ClosablePanel'
import Lobby from '../Lobby';
import {useNavigate} from 'react-router-dom';
import Utils from '../../Utils';

const MeetingRoom = (props) => {
  const navigate = useNavigate();

  const {
    selectedMeeting,
    isHost,
  } = props;

  const { settings } = props;

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
    };
  }, []);

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

  const joinPersonIn = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((myStream) => {
        setLoading(false);

        userStream.current = myStream;
        videoTrack.current = userStream.current.getTracks()[1];
        audioTrack.current = userStream.current.getTracks()[0];

        setCurrentUserStream(myStream);
        userVideo.current.srcObject = myStream;

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
          console.log("\n\n\nUSERS : ", users);
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
          const newParticipants =  participants.filter((p) => !Utils.isNull(p.peer) && p.peer.peerID !== userId);

          setParticipants(newParticipants);

          if (participants.length === 0) {
            endCall();
            navigate("/view/calendar");
          }

        });
      });
  };

  useEffect(() => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    socketRef.current = io.connect('http://localhost:8000');

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

  return (
    <div className={'grid-container row'}>
      {popUp[0] === '1' && (
        <AlertDialog
          title="Join request!"
          message={`${popUp.substr(2)} is requesting to join the call.`}
          showLeft={true}
          showRight={true}
          auto={false}
          btnTextLeft={'Decline'}
          btnTextRight={'Accept'}
          // onClose equivalent to deny
          onClose={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: false,
              id: joiningSocket.current,
            });
            setPopUp('');
          }}
          onLeft={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: false,
              id: joiningSocket.current,
            });
            setPopUp('');
          }}
          onRight={() => {
            socketRef.current.emit(MessageType.PERMIT_STATUS, {
              allowed: true,
              id: joiningSocket.current,
            });
            setPopUp('');
          }}
        />
      )}

      <div style={{ height: '100%', width: sideBarOpen ? '80%' : '100%' }} className={'col'}>
        {loading && popUp === 'Waiting' ? (
          <Lobby message={'Waiting for the meeting host to let you in'} />
        ) : (
          <>
            <div
              className={'centered-flex-box'}
              style={{
                height: 'calc(100% - 180px)',
                maxHeight: 'calc(100% - 180px)',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              { participants.length > 0 ? (
                  <MeetingParticipantGrid participants={participants} videoMuted={videoMuted} />
              ) :
                <Lobby message={'Waiting for others to join'} />
              }
            </div>
          </>
        )}
        <footer className="call-overlay-footer" style={{ height: '180px' }}>
          <div className={'row'}>
            <div className={'col'}>
              <h3
                style={{
                  position: 'absolute',
                  fontSize: 'auto',
                }}
              >
                {new Date().toLocaleString('en-US', {
                  hour12: true,
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </h3>
            </div>
            <div
              className={'col'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '80%',
              }}
            >
              <div className={'footer-toolbar'}>
                <div className={'row centered-flex-box'}>
                  {!screenShared && (
                    <IconButton
                      onClick={() => {
                        // if video stream exists
                        if (userStream.current) {
                          muteVideo();
                        }
                      }}
                      style={{
                        backgroundColor: videoMuted ? "#eb3f21" : "#404239",
                        color: 'white',
                        marginRight: '4px'
                      }}
                    >
                      { videoMuted ? (
                        <Icon id={'VIDEOCAM_OFF'} />
                      ) : (
                        <Icon id={'VIDEOCAM'} />
                      )}
                    </IconButton>
                  )}

                  <IconButton
                    onClick={() => {
                      // if audio stream exists
                      if (userStream.current) {
                        muteAudio();
                      }
                    }}
                    style={{
                      backgroundColor: audioMuted ? "#eb3f21" : "#404239",
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    {audioMuted ? (
                      <Icon id={'MIC_OFF'} />
                    ) : (
                      <Icon id={'MIC'} />
                    )}
                  </IconButton>
                  {" "}
                  <IconButton
                    onClick={() => {
                      // wait for stream to load first
                      if (userStream.current) {
                        if (screenShared) stopShareScreen();
                        else shareScreen();
                      }
                    }}
                    style={{
                      backgroundColor: screenShared ? '#8eb2f5' : '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    {screenShared ? (
                      <Icon id={'CANCEL_PRESENTATION'} />
                    ) : (
                      <Icon id={'PRESENT_TO_ALL'} />
                    )}
                  </IconButton>

                  <IconButton
                    style={{
                      backgroundColor: '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                    onClick={(e) => setSideBarOpen(true)}
                  >
                    <Icon id={'CHAT_BUBBLE'} />
                  </IconButton>

                  <IconButton
                    onClick={endCall}
                    style={{
                      backgroundColor: '#eb3f21',
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'CALL_END'} />
                  </IconButton>

                  <IconButton
                    onClick={(e) => setSideBarOpen(true)}
                    style={{
                      backgroundColor: '#404239',
                      color: 'white',
                      marginRight: '4px'
                    }}
                  >
                    <Icon id={'PEOPLE'} />
                  </IconButton>
                </div>
              </div>
            </div>
            <div
              className={'col'}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <section className="call-overlay-footer-yourself">
                <MeetingParticipant
                  data={{
                    peer: null,
                    name: 'Joe Doe',
                    avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
                  }}
                  videoMuted={videoMuted}
                  audioMuted={audioMuted}
                  displayName={false}
                  ref={userVideo}
                />
              </section>
            </div>
          </div>
        </footer>
      </div>
      {
        sideBarOpen &&
          <div className={"side-bar-container"}>
            <ClosablePanel closeHandler={(e) => {
              setSideBarOpen(false);
            }}/>
          </div>
      }
    </div>
  );
};

export default MeetingRoom;
