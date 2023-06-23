/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useState} from 'react';
import './MeetingParticipantGrid.css';
import MeetingParticipant from "../simplepeer/MeetingParticipant";
import LobbyWaitingList from "../LobbyWaitingList";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import appManager from "../../../../common/service/AppManager";
import Lobby from "../Lobby";
import {SystemEventType} from "../../../types";
import TalkerCard from "../TalkerCard";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const VH = 60;

const MeetingParticipantGrid = (props) => {
  const [participants, setParticipants] = React.useState([]);
  const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
  const [grid, setGrid] = React.useState(null);
  const [overflowGrid, setOverflowGrid] = React.useState(null);
  const [talkers, setTalkers] = React.useState([]);
  const [systemEventHandler] = useState({});
  const {
    waitingList,
    mode,
    step,
    userStream,
    videoMuted,
    audioMuted,
    isHost,
    autoPermit
  } = props;

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'meeting-participant-grid';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.PARTICIPANT_IN_VIEW:
            handleParticipantInView(be);
            break;
        }
      }
    }
  };

  const handleParticipantInView = (payload) => {
    let participant = participants.find(((p) => p.userId === payload.userId));
    if (participant) {
      let maxNumberOfInViewParticipants = MAX_ROWS * MAX_COLS;
      let participantsInView = participants.filter((p) => p.inView);

      if (participantsInView.length === maxNumberOfInViewParticipants) {
        let offViewParticipant = participantsInView[participantsInView.length - 1];
        offViewParticipant.inView = false;
        appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, offViewParticipant);
      }

      participant.inView = true;
      setGrid(null);
      setOverflowGrid(null);
    }
  };

  useEffect(() => {
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    if (grid === null && overflowGrid === null) {
      let gridData = createGrid(participants);
      console.log(gridData);
      setGrid(gridData.mainGrid);
      setOverflowGrid(gridData.overflowGrid);
    }
  }, [grid, overflowGrid]);

  function renderGrid() {
    let newParticipants = [];
    let currentUserParticipant = props.participants.find((p) => p.isCurrentUser);
    if (!currentUserParticipant) {
      currentUserParticipant = {
        isCurrentUser: true,
        userId: appManager.getUserDetails().userId,
        peer: null,
        name: appManager.getUserDetails().name,
        avatar: require('../../../../desktop/dashboard/images/noimage-person.png'),
        videoMuted,
        audioMuted
      };

      setCurrentUserParticipant(currentUserParticipant);
    }

    let i = 0;
    for (const participant of props.participants) {
      if (!participant.isCurrentUser) {
        newParticipants.push(participant);
      }

      if (participant.inView) {
        i++;
        continue;
      }

      if (i++ < (MAX_ROWS * MAX_COLS)) {
        participant.inView = true;
      }
    }

    setParticipants(newParticipants);
    let gridData = createGrid(newParticipants);
    console.log(gridData);
    setGrid(gridData.mainGrid);
    setOverflowGrid(gridData.overflowGrid);
  }

  useEffect(() => {
    if (props.participants && props.mode) {
      renderGrid();
    }
  }, [props.participants, props.mode]);


  useEffect(() => {
    appManager.addSubscriptions(systemEventHandler, SystemEventType.PARTICIPANT_IN_VIEW);

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
    };
  }, []);

  const createGrid = (participants) => {
    let itemGrid = {
      mainGrid: [],
      overflowGrid: []
    };

    if (mode === 'DEFAULT') {
      let inViewParticipants = participants.filter((p) => p.inView);
      let overflowParticipants = participants.filter((p) => !p.inView);
      let numRows = inViewParticipants.length < MAX_ROWS ? inViewParticipants.length : MAX_ROWS;
      let rows = inViewParticipants.length === 2 ? 1 : numRows;

      for (let i = 0; i < rows; i++) {
        itemGrid.mainGrid.push([]);
      }

      let currentRowIndex = 0;
      for (let i = 0; i < inViewParticipants.length; i++) {
        itemGrid.mainGrid[currentRowIndex].push(inViewParticipants[i]);
        if (currentRowIndex++ === rows - 1) {
          currentRowIndex = 0;
        }
      }

      for (const participant of overflowParticipants) {
        itemGrid.overflowGrid.push(participant);
      }
    } else {
      for (const participant of participants) {
        itemGrid.overflowGrid.push(participant);
      }
    }

    return itemGrid;
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
                                  refChangeHandler={
                                    participant.isCurrentUser ? (ref) => {
                                      props.userVideoChangeHandler(ref);
                                    } : null
                                  }
                                  onHostAudioMute={() => props.onHostAudioMute(participant)}
                                  onHostVideoMute={() => props.onHostVideoMute(participant)}
                                  showName={!participant.isCurrentUser}
                                  userStream={userStream}
                                  videoMuted={participant.videoMuted}
                                  audioMuted={participant.audioMuted}
                                  inView={participant.inView}
                                  isHost={isHost}/>
            </Grid>
          })}
        </React.Fragment>
      </Grid>
    )
  };

  function renderOverflowGrid() {
    return overflowGrid && overflowGrid.length > 0 &&
      <div
        style={{
          overflowX: 'auto',
          maxWidth: '100%',
          width: '100%',
          borderRadius: '4px',
          height: mode === 'STRIP' ? '120px' : null,
          overflowY: 'hidden',
          backgroundColor: mode === 'STRIP' ? 'rgb(40, 40, 43)' : 'transparent',
          alignItems: 'center'
        }}
        className="row flex-row flex-nowrap">
        {overflowGrid.map((participant, index) => {
          return <div className={'col-*-*'} key={index}
                      style={{
                        borderRadius: '4px',
                        minWidth: "200px",
                        padding: '4px',
                        height: '120px'
                      }}>
            <MeetingParticipant data={participant}
                                refChangeHandler={
                                  participant.isCurrentUser ? (ref) => {
                                    props.userVideoChangeHandler(ref);
                                  } : null
                                }
                                soundMonitor={(userId, quite) => {
                                  //console.log(userId + " is " + (quite ? "quite" : "speaking"));
                                  let participant = participants.find((p) => p.userId === userId);
                                  if(quite) {
                                    setTalkers(talkers.filter((t) => t.userId !== userId));
                                  } else {
                                    if(!talkers.find((t) => t.userId === userId)) {
                                      talkers.push({userId, name: participant.name});
                                      setTalkers([].concat(talkers));
                                    }
                                  }
                                }}
                                onHostAudioMute={() => props.onHostAudioMute(participant)}
                                onHostVideoMute={() => props.onHostVideoMute(participant)}
                                userStream={userStream}
                                isHost={isHost}
                                showName={!participant.isCurrentUser}
                                videoMuted={participant.videoMuted}
                                audioMuted={participant.audioMuted} sizing={'sm'}
                                inView={participant.inView}/>
          </div>
        })}
      </div>;
  }

  return (
    grid !== null ?
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
              height: step === "LOBBY" ? null : 'calc(100% - 220px)',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex'
            }}>
              <Grid container spacing={1} style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
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
            {
              <div style={{height: '48px', width: '100%', color: 'white', fontSize: '16px'}} className={}>
                {
                  (talkers && talkers.length > 0) &&
                  <>
                    {
                      talkers.map((talker, index) => {
                        return <TalkerCard data={talker} />
                      })
                    }
                  </>
                }
              </div>
            }
            <div className={'row'} style={{width: '100%', height: '88px', marginLeft: '0', marginRight: '0'}}>
              <div className={'col'}
                   style={{
                     width: 'calc(100% - 200px)',
                     height: '120px',
                     overflow: 'hidden',
                     display: 'flex',
                     alignItems: 'center',
                     paddingLeft: '16px',
                     paddingRight: '0'
                   }}>
                {
                  renderOverflowGrid()
                }
              </div>
              <div style={{width: '200px', height: '120px'}}>
                {
                  currentUserParticipant &&
                  <MeetingParticipant data={currentUserParticipant}
                                      onHostAudioMute={() => props.onHostAudioMute(currentUserParticipant)}
                                      onHostVideoMute={() => props.onHostVideoMute(currentUserParticipant)}
                                      showName={!currentUserParticipant.isCurrentUser}
                                      isCurrentUser={currentUserParticipant.isCurrentUser}
                                      userStream={userStream}
                                      videoMuted={currentUserParticipant.videoMuted}
                                      audioMuted={currentUserParticipant.audioMuted}
                                      videoHeight={'120px'}
                                      sizing={'md'}
                                      isHost={isHost}/>
                }
              </div>
            </div>
          </>
        }
        {
          (mode === 'STRIP' || step === "LOBBY") &&
          <div className={'row'} style={{width: '100%', height: '120px', marginLeft: '0', marginRight: '0'}}>
            {
              <div style={{height: '48px', width: '100%', color: 'white', fontSize: '16px'}}>
                {
                  (talkers && talkers.length > 0) &&
                  <>
                    {
                      talkers.map((talker, index) => {
                        return <TalkerCard data={talker} />
                      })
                    }
                  </>
                }
              </div>
            }
            <div style={{
                   width: 'calc(100% - 200px)',
                   height: '120px',
                   overflow: 'hidden',
                   display: 'flex',
                   alignItems: 'center',
                   paddingLeft: '16px',
                   paddingRight: '0'
                 }}>
              {
                renderOverflowGrid()
              }
            </div>
            <div style={{width: '200px'}}>
              {
                currentUserParticipant &&
                <MeetingParticipant data={currentUserParticipant}
                                    refChangeHandler={
                                      currentUserParticipant.isCurrentUser ? (ref) => {
                                        props.userVideoChangeHandler(ref);
                                      } : null
                                    }
                                    onHostAudioMute={() => props.onHostAudioMute(currentUserParticipant)}
                                    onHostVideoMute={() => props.onHostVideoMute(currentUserParticipant)}
                                    showName={!currentUserParticipant.isCurrentUser}
                                    isCurrentUser={currentUserParticipant.isCurrentUser}
                                    userStream={userStream}
                                    videoMuted={currentUserParticipant.videoMuted}
                                    audioMuted={currentUserParticipant.audioMuted}
                                    videoHeight={'120px'}
                                    sizing={'md'}
                                    isHost={isHost}/>
              }
            </div>
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
      </div>
      :
      null
  )
};

export default MeetingParticipantGrid;