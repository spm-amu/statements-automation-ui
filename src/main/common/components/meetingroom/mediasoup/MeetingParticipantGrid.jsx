/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect} from 'react';
import './MeetingParticipantGrid.css';
import LobbyWaitingList from "../LobbyWaitingList";
import Lobby from "../Lobby";
import Grid from "@material-ui/core/Grid";
import MeetingParticipant from "../mediasoup/MeetingParticipant";
import Box from "@material-ui/core/Box";
import appManager from "../../../service/AppManager";
import mediaSoupHelper from "./MediaSoupHelper";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const VH = 60;

const MeetingParticipantGrid = (props) => {
  const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
  const [inViewParticipants, setInViewParticipants] = React.useState([]);
  const [consumerTransport, setConsumerTransport] = React.useState(null);
  const [participantDevice, setParticipantDevice] = React.useState(null);
  const [producerTransport, setProducerTransport] = React.useState(null);
  const [grid, setGrid] = React.useState(null);
  const {
    waitingList,
    mode,
    step,
    meetingId,
    videoMuted,
    audioMuted,
    isHost,
    autoPermit,
    rtpCapabilities
  } = props;

  const setupSelfDevices = async () => {
    let device = await mediaSoupHelper.getParticipantDevice(rtpCapabilities);
    setParticipantDevice(device);
    setConsumerTransport(await mediaSoupHelper.initConsumerTransport(device, meetingId, appManager.getUserDetails().userId));
    setProducerTransport(await mediaSoupHelper.initProducerTransport(device, meetingId, appManager.getUserDetails().userId));
  };

  useEffect(() => {
    setupSelfDevices();
  }, []);

  useEffect(() => {
    if (props.participants && props.mode) {
      setCurrentUserParticipant({
        isCurrentUser: true,
        userId: appManager.getUserDetails().userId,
        peer: null,
        name: appManager.getUserDetails().name,
        avatar: require('../../../../desktop/dashboard/images/noimage-person.png'),
        videoMuted,
        audioMuted
      });

      setupGrid();
    }
  }, [props.participants, props.mode]);

  const setupGrid = () => {
    let counter = 0;
    inViewParticipants.splice(0, inViewParticipants.length);
    for (const participant of props.participants) {
      inViewParticipants.push(participant);
      if (counter++ >= MAX_ROWS * MAX_COLS) {
        break;
      }
    }

    let inViewGrid = [];
    let numRows = inViewParticipants.length < MAX_ROWS ? inViewParticipants.length : MAX_ROWS;
    let rows = inViewParticipants.length === 2 ? 1 : numRows;

    if (props.mode === 'DEFAULT') {
      for (let i = 0; i < rows; i++) {
        inViewGrid.push([]);
      }

      let currentRowIndex = 0;
      for (let i = 0; i < props.participants.length; i++) {
        inViewGrid[currentRowIndex].push(props.participants[i]);
        if (currentRowIndex++ === rows - 1) {
          currentRowIndex = 0;
        }
      }
    } else {
      inViewGrid.push([]);
      for (const inViewParticipant of inViewParticipants) {
        inViewGrid[0].push(inViewParticipant);
      }
    }

    setGrid(inViewGrid);
  };

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
    grid !== null && participantDevice ?
      <div className={'row grid'}
           style={{height: mode === 'DEFAULT' ? '100%' : null, width: '100%'}}>
        {
          step === "LOBBY" &&
          <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={props.userToCall} displayState={props.displayState}
                 meetingTitle={props.meetingTitle}/>
        }
        {
          grid && mode === 'DEFAULT' && step !== "LOBBY" &&
          <>
            <Box sx={{
              flexGrow: 1,
              height: step === "LOBBY" ? null : '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex'
            }}>
              <Grid container spacing={1} style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                border: '2px solid white'
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
          </>
        }
        {
          (mode === 'STRIP' || step === "LOBBY") &&
          <div className={'row'} style={{width: '100%', height: '120px', marginLeft: '0', marginRight: '0'}}>
          </div>
        }
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
        {
          currentUserParticipant &&
          <div style={{width: '200px', height: '120px', position: 'absolute', right: '4px', bottom: '0'}}>
            <MeetingParticipant data={currentUserParticipant}
                                device={participantDevice}
                                meetingId={meetingId}
                                rtpCapabilities={rtpCapabilities}
                                isCurrentUser={true}
                                producerTransport={producerTransport}
                                audioMuted={audioMuted}
                                videoMuted={videoMuted}
                                onHostAudioMute={() => props.onHostAudioMute(currentUserParticipant)}
                                onHostVideoMute={() => props.onHostVideoMute(currentUserParticipant)}
                                isHost={isHost}/>
          </div>
        }
      </div>
      :
      null
  )
};

export default MeetingParticipantGrid;
