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

const MAX_COLS = 3;
const MAX_ROWS = 2;
const VH = 64;

const MeetingParticipantGrid = (props) => {
    const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
    const [inViewParticipants, setInViewParticipants] = React.useState([]);
    const [consumerTransport, setConsumerTransport] = React.useState(null);
    const [participantDevice, setParticipantDevice] = React.useState(null);
    const [producerTransport, setProducerTransport] = React.useState(null);
    const [grid, setGrid] = React.useState(null);
    const [systemEventHandler] = useState({});
    const transports = useRef(new Transports());
    const {
      waitingList,
      step,
      meetingId,
      whiteBoardShown,
      screenShared,
      videoMuted,
      audioMuted,
      isHost,
      autoPermit,
      rtpCapabilities
    } = props;

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
      if (inViewParticipants.length === MAX_COLS * MAX_ROWS) {
        let offViewParticipant = inViewParticipants[inViewParticipants.length - 1];
        appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, offViewParticipant);

        inViewParticipants.splice(inViewParticipants.length - 1, 1);
        offViewParticipant.inView = false;
      }

      let participant = props.participants.find(((p) => p.userId === payload.userId));
      inViewParticipants.push(participant);
      setupGrid();
    };

    const removeFromView = (participant) => {
      participant.inView = false;
      inViewParticipants.splice(inViewParticipants.findIndex((p) => p.userId === participant.userId), 1);
      appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, participant);
      setupGrid();
    };

    const setupSelfDevices = async () => {
      let device = await mediaSoupHelper.getParticipantDevice(rtpCapabilities);
      setParticipantDevice(device);

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
                                  device={participantDevice}
                                  meetingId={meetingId}
                                  audioMuted={audioMuted}
                                  videoMuted={videoMuted}
                                  onRemoveFromView={(participant) => removeFromView(participant)}
                                  consumerTransport={consumerTransport}
                                  rtpCapabilities={rtpCapabilities}
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
                  width: (VH / (MAX_ROWS === 1 ? 2 : MAX_ROWS)) + "vh",
                  height: (VH / (MAX_ROWS === 1 ? 2 : MAX_ROWS)) + "vh",
                  flexBasis: null,
                  maxWidth: null
                }
              }
              >
                <MeetingParticipant data={participant}
                                    device={participantDevice}
                                    meetingId={meetingId}
                                    audioMuted={audioMuted}
                                    videoMuted={videoMuted}
                                    onRemoveFromView={(participant) => removeFromView(participant)}
                                    consumerTransport={consumerTransport}
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
      participantDevice ?
        <div className={'row grid'}
             style={{height: '100%', width: '100%', padding: '8px'}}>
          {
            step === "LOBBY" &&
            <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={props.userToCall} displayState={props.displayState}
                   meetingTitle={props.meetingTitle}/>
          }
          <div className={'row'} style={{
            width: '100%',
            height: '40px',
            marginLeft: '0',
            marginRight: '0',
            border: '2px solid red',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '16px',
            padding: '4px'
          }}>
            Amu is sharing
          </div>
          {
            grid && step !== "LOBBY" &&
            <>
              {
                (!screenShared && !whiteBoardShown) ?
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
                      border: '2px solid white',
                      maxHeight: '100%',
                      overflowY: 'hidden',
                      overflowX: 'hidden'
                    }}>
                      {grid.map((row, index) => {
                        return <div style={{
                          width: "100%",
                          height: (VH / (MAX_ROWS === 1 ? 2 : MAX_ROWS)) + "vh"
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
                  screenShared ?
                    <div className={'content-box'}>
                      Sharing...
                    </div>
                    :
                    whiteBoardShown &&
                    <div className={'content-box'}>
                      Whiteboard...
                    </div>
              }
            </>
          }
          <div className={'row'} style={{
            width: '100%',
            height: '40px',
            marginLeft: '0',
            marginRight: '0',
            border: '2px solid red',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '16px',
            padding: '4px'
          }}>
            Talker space
          </div>
          <div className={'row'} style={{
            width: '100%',
            height: '152px',
            marginLeft: '0',
            marginRight: '0',
            border: '2px solid red',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{width: 'calc(100% - 232px)', height: '148px', border: '2px solid blue'}}>
              {
                ((screenShared || whiteBoardShown || step === "LOBBY") && grid) &&
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
                                    device={participantDevice}
                                    meetingId={meetingId}
                                    rtpCapabilities={rtpCapabilities}
                                    isCurrentUser={true}
                                    consumerTransport={consumerTransport}
                                    producerTransport={producerTransport}
                                    audioMuted={audioMuted}
                                    videoMuted={videoMuted}
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
