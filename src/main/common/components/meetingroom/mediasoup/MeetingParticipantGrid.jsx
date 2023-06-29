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
import {SystemEventType} from "../../../types";
import Icon from "../../Icon";

const MAX_COLS = 3;
const MAX_ROWS = 2;

const MeetingParticipantGrid = (props) => {
    const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
    const [inViewParticipants, setInViewParticipants] = React.useState([]);
    const [consumerTransport, setConsumerTransport] = React.useState(null);
    const [device, setDevice] = React.useState(null);
    const [shareScreenProducer, setShareScreenProducer] = React.useState(null);
    const [producerTransport, setProducerTransport] = React.useState(null);
    const [shareScreenSource, setShareScreenSource] = React.useState(null);
    const [screenShared, setScreenShared] = React.useState(null);
    const [showSharedScreen, setShowSharedScreen] = React.useState(false);
    const [grid, setGrid] = React.useState(null);
    const [systemEventHandler] = useState({});
    const transports = useRef(new Transports());
    const shareScreenRef = useRef();
    const {
      waitingList,
      step,
      meetingId,
      whiteBoardShown,
      videoMuted,
      audioMuted,
      isHost,
      autoPermit,
      rtpCapabilities
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
        track
      };

      //let producer = await producerTransport.produce(params);
      //setShareScreenProducer(producer);

      if (showSharedScreen) {
        shareScreenRef.current.srcObject = stream;
      }

      /*if (type === 'video') {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          tmpVideoRef.current = stream;
        }
      }*/

      /*producer.on('transportclose', () => {
        stream.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });

        producers.delete(type)
      });

      producer.on('close', () => {
        stream.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });

        producers.delete(type)
      });*/
    };


    const stopProducingScreenShare = async () => {
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
          }
        }
      }
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
        setupGrid();
      }
    };

    const removeFromView = (participant) => {
      participant.inView = false;
      inViewParticipants.splice(inViewParticipants.findIndex((p) => p.userId === participant.userId), 1);
      appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, participant);
      setupGrid();
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
      systemEventHandler.api = systemEventHandlerApi();
    });

    useEffect(() => {
      if (screenShared && shareScreenSource) {
        produceScreenShare();
      } else {
        stopProducingScreenShare();
      }
    }, [screenShared, shareScreenSource]);

    useEffect(() => {
      setShareScreenSource(props.shareScreenSource);
      if (props.shareScreenSource) {
        setShowSharedScreen(
          props.shareScreenSource.name.toLowerCase() !== 'entire screen' &&
          props.shareScreenSource.name.toLowerCase() !== 'armscor connect'
        )
      }
    }, [props.shareScreenSource]);

    useEffect(() => {
      setScreenShared(props.screenShared);
    }, [props.screenShared]);

    useEffect(() => {
      appManager.addSubscriptions(systemEventHandler, SystemEventType.PARTICIPANT_IN_VIEW);
      setupSelfDevices();
      return () => {
        appManager.removeSubscriptions(systemEventHandler);

        transports.current.closeConsumerTransport();
        transports.current.closeProducerTransport();
      };
    }, []);

    useEffect(() => {
      if (grid) {
        props.onGridSetup();
      }
    }, grid);

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
              return <Grid item xs={4} key={index}
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
            step === "LOBBY" &&
            <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={props.userToCall} displayState={props.displayState}
                   meetingTitle={props.meetingTitle}/>
          }
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
              {screenShared && shareScreenSource && !showSharedScreen && (
                <div className={'row no-margin no-padding'}>
                  <div>
                    <Icon id={'WARNING'} color={'rgb(235, 63, 33)'}/>
                  </div>
                  <div>
                    {
                      (shareScreenSource.name.toLowerCase() === 'entire screen' ? 'Your entire screen' : 'The ' + shareScreenSource.name + ' window')
                      + ' is being shared with other participants'
                    }
                  </div>
                </div>
              )}
            </div>
          }
          {
            grid && step !== "LOBBY" &&
            <>
              {
                (!screenShared && !whiteBoardShown || (screenShared && !showSharedScreen)) ?
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
                  :
                  (screenShared && showSharedScreen) ?
                    <div className={'content-box'}>
                      <video
                        hidden={false}
                        muted playsinline autoPlay ref={shareScreenRef}
                        style={{width: '100%', height: '100%', borderRadius: '4px', zIndex: 0}}
                      />
                    </div>
                    :
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
                (((screenShared && showSharedScreen) || whiteBoardShown || step === "LOBBY") && grid) &&
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
                                    rtpCapabilities={rtpCapabilities}
                                    isCurrentUser={true}
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
                top: '112px',
                right: '48px'
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
