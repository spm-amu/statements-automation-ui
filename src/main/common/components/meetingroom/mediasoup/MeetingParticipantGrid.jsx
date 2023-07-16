/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useRef, useState} from 'react';
import './MeetingParticipantGrid.css';
import LobbyWaitingList from "../LobbyWaitingList";
import Lobby from "../Lobby";
import Grid from "@material-ui/core/Grid";
import MeetingParticipant from "../mediasoup/MeetingParticipant";
import Box from "@material-ui/core/Box";
import appManager from "../../../service/AppManager";
import mediaSoupHelper from "./MediaSoupHelper";
import Transports from "./Transports";
import {MessageType, SystemEventType} from "../../../types";
import Icon from "../../Icon";
import socketManager from "../../../service/SocketManager";

const MAX_COLS = 3;
const MAX_ROWS = 2;

// TODO : Clean-up all tracks and producers and consumers when the component closes
const MeetingParticipantGrid = (props) => {
    const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
    const [inViewParticipants, setInViewParticipants] = React.useState([]);
    const [consumerTransport, setConsumerTransport] = React.useState(null);
    //const [videoRefresher, setVideoRefresher] = React.useState(false);
    const [device, setDevice] = React.useState(null);
    const [shareScreenProducer, setShareScreenProducer] = React.useState(null);
    const [producerTransport, setProducerTransport] = React.useState(null);
    const [shareScreenSource, setShareScreenSource] = React.useState(null);
    const [screenShared, setScreenShared] = React.useState(null);
    const [someoneSharing, setSomeoneSharing] = React.useState(null);
    const [showSharedScreen, setShowSharedScreen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [shareScreenConsumer, setShareScreenConsumer] = React.useState(null);
    const [grid, setGrid] = React.useState(null);
    const [systemEventHandler] = useState({});
    const [eventHandler] = useState({});
    const transports = useRef(new Transports());
    const shareScreenVideoRef = useRef();
    const shareScreenStream = useRef();
    const {
      waitingList,
      step,
      meetingId,
      meetingTitle,
      whiteBoardShown,
      videoMuted,
      audioMuted,
      isHost,
      autoPermit,
      rtpCapabilities,
      onloadScreenShareData
    } = props;

    const produceScreenShare = async () => {
      if (!device) {
        console.error('No available device');
        return;
      }

      if (!device.canProduce('video')) {
        console.error('Cannot produce screen share');
        return;
      }

      if (shareScreenProducer) {
        console.log('Share screen producer already exist');
        return
      }

      const videoConstraints = {
        cursor: true,
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: shareScreenSource.id,
            width: {min: 160, ideal: 320, max: 640},
            height: {min: 120, ideal: 240, max: 480},
            frameRate: {
              min: 15,
              max: 15
            },
            googCpuOveruseDetection: true,
            googCpuOveruseEncodeUsage: true,
            googCpuOveruseThreshold: 70
          }
        }
      };

      let stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      const track = stream.getVideoTracks()[0];
      const params = {
        track,
        appData: {
          screenSharing: true
        }
      };

      let producer = await producerTransport.produce(params);
      setShareScreenProducer(producer);

      shareScreenStream.current = stream;
      if (showSharedScreen) {
        shareScreenVideoRef.current.srcObject = stream;
      }

      producer.on('transportclose', () => {
        stream.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });

        setShareScreenProducer(null);
      });

      producer.on('close', () => {
        stream.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });

        setShareScreenProducer(null);
      });
    };

    const stopProducingScreenShare = async () => {
      if (!shareScreenProducer) {
        console.log('There is no share screen producer');
        return;
      }

      let producerId = shareScreenProducer.id;
      console.log('Close producer', producerId);
      socketManager.emitEvent(MessageType.PRODUCER_CLOSED, {
        userId: appManager.getUserDetails().userId,
        producerId,
        roomId: meetingId
      }).catch((e) => console.log("PRODUCER_CLOSED ERROR : ", e));

      shareScreenProducer.close();
      stopShareScreenConsumerTracks();
      setShareScreenProducer(null);
      setSomeoneSharing(false);
      setShareScreenSource(null);
      setScreenShared(false);

      if(shareScreenStream.current) {
        for (const track of shareScreenStream.current.getTracks()) {
          track.stop();
        }
      }
    };

    const onNewProducers = (producers) => {
      let screenShareProducer = producers.find((p) => p.screenSharing);
      if (screenShareProducer) {
        consume(screenShareProducer);
      }
    };

    const stopShareScreenConsumerTracks = () => {
      let el = document.getElementById('share-screen-video');
      if (el) {
        for (const track of el.srcObject.getTracks()) {
          track.stop();
        }

        el.parentNode.removeChild(el);
      }
    };

    const consume = async (producer) => {
      mediaSoupHelper.getConsumeStream(producer.producerId, device.rtpCapabilities, consumerTransport,
        props.meetingId, appManager.getUserDetails().userId, 'video').then(
        ({consumer, stream, kind}) => {
          if (consumer) {
            setShareScreenConsumer(consumer);

            console.log("\n\n\n=====================================SHARING CONSUME=====================================");
            props.sharingHandler(true);
            setScreenShared(true);
            setSomeoneSharing(true);
            //setShowSharedScreen(true);
            setShareScreenSource(null);
            setMessage(producer.username + " is sharing");
            shareScreenVideoRef.current.srcObject = stream;
            shareScreenStream.current = stream;
            //setVideoRefresher(!videoRefresher);

            consumer.on(
              'trackended',
              () => {
                stopShareScreenConsumerTracks()
              }
            );

            consumer.on(
              'transportclose',
              () => {
                stopShareScreenConsumerTracks()
              }
            )
          }
        }
      )
    };


    const handler = () => {
      return {
        get id() {
          return 'meeting-participant-grid';
        },
        on: (eventType, be) => {
          switch (eventType) {
            case MessageType.NEW_PRODUCERS:
              onNewProducers(be.payload);
              break;
            case MessageType.CONSUMER_CLOSED:
              if (shareScreenConsumer && shareScreenConsumer.id === be.payload.consumerId) {
                stopShareScreenConsumerTracks();
                setMessage(null);
                props.sharingHandler(false);
                setSomeoneSharing(false);
                setScreenShared(false);
                setShowSharedScreen(false);
              }
              break;
          }
        }
      }
    };

    const systemEventHandlerApi = () => {
      return {
        get id() {
          return 'meeting-participant-grid';
        },
        on: (eventType, be) => {
          switch (eventType) {
            case SystemEventType.PARTICIPANT_IN_VIEW:
              onBringToView(be);
              break;
            case SystemEventType.CONSUMER_TRANSPORT_FAILED:
              onConsumerTransportFailure();
              break;
          }
        }
      }
    };

    const onConsumerTransportFailure = async () => {
      let consumerTransport = await mediaSoupHelper.initConsumerTransport(device, meetingId, appManager.getUserDetails().userId);
      setConsumerTransport(consumerTransport);
    };

    const onBringToView = (payload) => {
      if (!inViewParticipants.find(((p) => p.userId === payload.userId))) {
        if (inViewParticipants.length === MAX_COLS * MAX_ROWS) {
          let offViewParticipant = inViewParticipants[inViewParticipants.length - 1];
          appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, offViewParticipant);

          inViewParticipants.splice(inViewParticipants.length - 1, 1);
          offViewParticipant.inView = false;
        }

        let participant = props.participants.find(((p) => p.userId === payload.userId));
        inViewParticipants.push(participant);

        // Refresh the list
        setInViewParticipants([].concat(inViewParticipants));
      }
    };

    const removeFromView = (participant) => {
      participant.inView = false;
      setInViewParticipants(inViewParticipants.filter((p) => p.userId !== participant.userId));
      appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, participant);
    };

    const setupSelfDevices = async () => {
      let device = await mediaSoupHelper.getParticipantDevice(rtpCapabilities);
      setDevice(device);

      let consumerTransport = await mediaSoupHelper.initConsumerTransport(device, meetingId, appManager.getUserDetails().userId);
      let producerTransport = await mediaSoupHelper.initProducerTransport(device, meetingId, appManager.getUserDetails().userId);

      setConsumerTransport(consumerTransport);
      setProducerTransport(producerTransport);

      transports.current.setConsumerTransport(consumerTransport);
      transports.current.setProducerTransport(producerTransport);
    };

    useEffect(() => {
      eventHandler.api = handler();
      systemEventHandler.api = systemEventHandlerApi();
    });

    useEffect(() => {
      setupGrid();
    }, [inViewParticipants]);

    /*useEffect(() => {
      if(grid === null) {
        setupGrid();
      }
    }, [grid]);*/

    useEffect(() => {
      if (screenShared && shareScreenSource) {
        produceScreenShare();
      } else {
        stopProducingScreenShare();
      }
    }, [screenShared, shareScreenSource]);

    useEffect(() => {
      if(onloadScreenShareData && device && consumerTransport) {
        consume(onloadScreenShareData);
      }
    }, [onloadScreenShareData, device, consumerTransport]);

    useEffect(() => {
      setShareScreenSource(props.shareScreenSource);
      if (props.shareScreenSource && props.shareScreenSource.name) {
        setShowSharedScreen(
          props.shareScreenSource.name?.toLowerCase() !== 'entire screen' &&
          props.shareScreenSource.name.toLowerCase() !== 'armscor connect'
        )
      }
    }, [props.shareScreenSource]);

    useEffect(() => {
      setScreenShared(props.screenShared);
    }, [props.screenShared]);

    useEffect(() => {
      appManager.addSubscriptions(systemEventHandler, SystemEventType.PARTICIPANT_IN_VIEW, SystemEventType.CONSUMER_TRANSPORT_FAILED);
      socketManager.addSubscriptions(eventHandler, MessageType.NEW_PRODUCERS, MessageType.CONSUMER_CLOSED);
      setupSelfDevices();
      return () => {
        appManager.removeSubscriptions(systemEventHandler);
        socketManager.removeSubscriptions(eventHandler);

        transports.current.closeConsumerTransport();
        transports.current.closeProducerTransport();
      };
    }, []);

    useEffect(() => {
      if (grid) {
        props.onGridSetup();
      }
    }, [grid]);

    useEffect(() => {
      if (props.participants) {
        setCurrentUserParticipant({
          isCurrentUser: true,
          userId: appManager.getUserDetails().userId,
          peer: null,
          name: appManager.getUserDetails().name,
          avatar: require('../../../../desktop/dashboard/images/noimage-person.png'),
          videoMuted,
          audioMuted
        });

        let counter = 0;
        inViewParticipants.splice(0, inViewParticipants.length);
        for (const participant of props.participants) {
          participant.inView = true;
          inViewParticipants.push(participant);
          if (++counter >= MAX_ROWS * MAX_COLS) {
            break;
          }
        }

        setupGrid(inViewParticipants);
      }
    }, [props.participants]);

    const setupGrid = () => {
      let inViewGrid = [];
      let numRows = inViewParticipants.length < MAX_ROWS ? inViewParticipants.length : MAX_ROWS;
      let rows = inViewParticipants.length === 2 ? 1 : numRows;

      for (let i = 0; i < rows; i++) {
        inViewGrid.push([]);
      }

      let currentRowIndex = 0;
      for (let i = 0; i < inViewParticipants.length; i++) {
        inViewGrid[currentRowIndex].push(inViewParticipants[i]);
        if (currentRowIndex++ === rows - 1) {
          currentRowIndex = 0;
        }
      }

      setGrid(inViewGrid);
    };

    function renderStrip() {
      return inViewParticipants && inViewParticipants.length > 0 &&
        <div
          style={{
            overflowX: 'auto',
            maxWidth: '100%',
            width: '100%',
            borderRadius: '4px',
            height: '148px',
            overflowY: 'hidden',
            alignItems: 'center'
          }}
          className="row flex-row flex-nowrap">
          {inViewParticipants.map((participant, index) => {
            return <div className={'col-*-*'} key={index}
                        style={{
                          borderRadius: '4px',
                          minWidth: "200px",
                          padding: '4px',
                          height: '148px'
                        }}>
              <MeetingParticipant data={participant}
                                  device={device}
                                  meetingId={meetingId}
                                  audioMuted={audioMuted}
                                  videoMuted={videoMuted}
                                  onRemoveFromView={(participant) => removeFromView(participant)}
                                  consumerTransport={consumerTransport}
                                  rtpCapabilities={rtpCapabilities}
                                  numberOfInViewParticipants={inViewParticipants.length}
                                  sizing={'sm'}
                                  onHostAudioMute={() => props.onHostAudioMute(participant)}
                                  onHostVideoMute={() => props.onHostVideoMute(participant)}
                                  isHost={isHost}/>
            </div>
          })}
        </div>;
    }

    const renderRow = (row, index) => {
      return (
        <Grid
          style={{height: '100%'}}
          key={index}
          direction="row"
          justifyContent="center"
          alignItems="center" container item spacing={2}>
          <React.Fragment>
            {row.map((participant, index) => {
              return <Grid item xs={4} key={index + "-" + participant.userId}
                           className={'meetingParticipantContainer'} style={
                {
                  borderRadius: '4px',
                  width: (100 / row.length) + "%",
                  height: "100%",
                  flexBasis: null,
                  maxWidth: null
                }
              }
              >
                <MeetingParticipant data={participant}
                                    device={device}
                                    meetingId={meetingId}
                                    audioMuted={audioMuted}
                                    videoMuted={videoMuted}
                                    onRemoveFromView={(participant) => removeFromView(participant)}
                                    consumerTransport={consumerTransport}
                                    numberOfInViewParticipants={inViewParticipants.length}
                                    rtpCapabilities={rtpCapabilities}
                                    onHostAudioMute={() => props.onHostAudioMute(participant)}
                                    onHostVideoMute={() => props.onHostVideoMute(participant)}
                                    isHost={isHost}/>
              </Grid>
            })}
          </React.Fragment>
        </Grid>
      )
    };

    return (
      device ?
        <div className={'row grid'}
             style={{height: '100%', width: '100%'}}>
          {
            step !== "LOBBY" &&
            <div className={'row messages'} style={{
              width: '100%',
              height: '40px',
              marginLeft: '0',
              marginRight: '0',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: '16px',
              padding: '4px',
              overflowY: 'auto'
            }}>
              {((screenShared && shareScreenSource && !showSharedScreen) || someoneSharing) && (
                <div className={'row no-margin no-padding'}>
                  {
                    shareScreenSource && shareScreenSource.name &&
                    <>
                      <div>
                        <Icon id={'WARNING'} color={'rgb(235, 63, 33)'}/>
                      </div>
                      <div>
                        {
                          (shareScreenSource.name.toLowerCase() === 'entire screen' ? 'Your entire screen' : 'The ' + shareScreenSource.name + ' window')
                          + ' is being shared with other participants'
                        }
                      </div>
                    </>
                  }
                  {
                    message &&
                    <span>
                        {message}
                      </span>
                  }
                </div>
              )}
            </div>
          }
          {
            grid && step !== "LOBBY" &&
            <>
              {
                (!screenShared && !whiteBoardShown || (screenShared && !showSharedScreen) && !someoneSharing) &&
                <Box sx={{
                  flexGrow: 1,
                  height: 'calc(100% - 232px)',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex'
                }}>
                  <Grid container spacing={1} style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    maxHeight: '100%',
                    height: "100%",
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}>
                    {grid.map((row, index) => {
                      return <div style={{
                        width: "100%",
                        height: (100 / grid.length) + "%",
                        maxHeight: "50%"
                      }}>
                        {
                          <Fragment key={index}>
                            {
                              renderRow(row, index)
                            }
                          </Fragment>
                        }
                      </div>
                    })}
                  </Grid>
                </Box>
              }
              {
                <div className={'content-box'} style={{
                  display: (!((screenShared && showSharedScreen) || someoneSharing)) ? 'none' : null
                }}>
                  <video
                    id={'screen-share-video'}
                    width={640}
                    height={320}
                    autoPlay ref={shareScreenVideoRef} muted
                    style={{
                      width: '100%',
                      height: '100%',
                      zIndex: '0'
                    }}
                  />
                </div>
              }
              {
                whiteBoardShown &&
                <div className={'content-box'}>
                  Whiteboard...
                </div>
              }
            </>
          }
          {
            step !== "LOBBY" &&
            <div className={'row'} style={{
              width: '100%',
              height: '40px',
              marginLeft: '0',
              marginRight: '0',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: '16px',
              padding: '4px'
            }}>
            </div>
          }
          <div className={'row'} style={{
            width: '100%',
            height: '152px',
            marginLeft: '12px',
            marginRight: '0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{width: 'calc(100% - 232px)', height: '148px'}}>
              {
                (((screenShared && showSharedScreen) || whiteBoardShown || step === "LOBBY" || someoneSharing) && grid) &&
                <div style={{width: '100%', height: '100%'}}>
                  {
                    renderStrip()
                  }
                </div>
              }
            </div>
            <div className={'col no-margin no-padding'} style={{width: '200px', height: '148px'}}>
              {
                currentUserParticipant &&
                <MeetingParticipant data={currentUserParticipant}
                                    device={device}
                                    meetingId={meetingId}
                                    meetingTitle={meetingTitle}
                                    rtpCapabilities={rtpCapabilities}
                                    isCurrentUser={true}
                                    onNewAudioDevice={props.onNewAudioDevice}
                                    consumerTransport={consumerTransport}
                                    producerTransport={producerTransport}
                                    audioMuted={audioMuted}
                                    videoMuted={videoMuted}
                                    numberOfInViewParticipants={inViewParticipants.length}
                                    sizing={'md'}
                                    onHostAudioMute={() => props.onHostAudioMute(currentUserParticipant)}
                                    onHostVideoMute={() => props.onHostVideoMute(currentUserParticipant)}
                                    isHost={isHost}/>
              }
            </div>
          </div>
          {
            ((waitingList && waitingList.length > 0)) &&
            <div className={'no-side-margin no-side-padding grid-side-bar'} style={
              {
                backgroundColor: 'transparent',
                position: 'absolute',
                top: '0',
                right: '16px'
              }
            }>
              {
                waitingList && waitingList.length > 0 &&
                <LobbyWaitingList waitingList={waitingList}
                                  autoHeight={true}
                                  rejectUserHandler={props.rejectUserHandler}
                                  acceptUserHandler={props.acceptUserHandler}/>
              }
            </div>
          }
        </div>
        :
        null
    )
  }
;

export default MeetingParticipantGrid;
