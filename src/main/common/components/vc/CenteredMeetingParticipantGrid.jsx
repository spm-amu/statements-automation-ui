/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useState} from 'react';
import './CenteredMeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";
import LobbyWaitingList from "./LobbyWaitingList";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import appManager from "../../../common/service/AppManager";
import Lobby from "./Lobby";
import {SystemEventType} from "../../types";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const VH = 60;

const MeetingParticipantGrid = (props) => {
  const [participants, setParticipants] = React.useState([]);
  const [currentUserParticipant, setCurrentUserParticipant] = React.useState(null);
  const [grid, setGrid] = React.useState(null);
  const [overflowGrid, setOverflowGrid] = React.useState(null);
  const [refresher, setRefresher] = React.useState(false);
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
    if(participant) {
      let maxNumberOfInViewParticipants = MAX_ROWS * MAX_COLS;
      let participantsInView = participants.filter((p) => p.inView);

      if(participantsInView.length === maxNumberOfInViewParticipants) {
        let offViewParticipant = participantsInView[participantsInView.length - 1];
        offViewParticipant.inView = false;
        offViewParticipant.active = false;
        appManager.fireEvent(SystemEventType.PARTICIPANT_OFF_VIEW, offViewParticipant);
      }

      participant.inView = true;
      participant.active = true;

      console.log("\n\n\n\n\n\n\n\nparticipantsInView : " + participant.userId + " : " + participant.inView);
      console.log("\n\n\n\n\n\n\n\nPARTS STATE : ", participants);

      setGrid(null);
      setOverflowGrid(null);
    }
  };

  useEffect(() => {
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    if(grid === null && overflowGrid === null) {
      let gridData = createGrid(participants);
      console.log(gridData);
      setGrid(gridData.mainGrid);
      setOverflowGrid(gridData.overflowGrid);
    }
  }, [grid, overflowGrid]);

  useEffect(() => {
    if (props.participants && props.mode) {
      let newParticipants = [];
      let currentUserParticipant = props.participants.find((p) => p.isCurrentUser);
      if (!currentUserParticipant) {
        currentUserParticipant = {
          isCurrentUser: true,
          userId: appManager.getUserDetails().userId,
          peer: null,
          name: appManager.getUserDetails().name,
          avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
          videoMuted,
          audioMuted
        };

        setCurrentUserParticipant(currentUserParticipant);
        currentUserParticipant.active = true;
        //currentUserParticipant.inView = true;
        //newParticipants.push(currentUserParticipant);
      }

      let i = 0;
      let participantsInView = props.participants.filter((p) => p.inView);
      for (const participant of participantsInView) {
        if (i++ < (MAX_ROWS * MAX_COLS)) {
          participant.active = true;
          participant.inView = true;
        }
      }

      for (const participant of props.participants) {
        if (!participant.isCurrentUser) {
          newParticipants.push(participant);
        } else {
          participant.active = true;
          participant.inView = true;
        }

        if (i++ < (MAX_ROWS * MAX_COLS)) {
          participant.active = true;
          participant.inView = true;
        }
      }

      console.log("\n\n\nPARTS : ", newParticipants);

      setParticipants(newParticipants);
      let gridData = createGrid(newParticipants);
      console.log(gridData);
      setGrid(gridData.mainGrid);
      setOverflowGrid(gridData.overflowGrid);
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
      let inViewParticipants =participants.filter((p) => p.inView);
      let overflowParticipants = participants.filter((p) => !p.inView).sort(function (a, b) {
        return b.active - a.active
      });
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
                                  active={participant.active}
                                  inView={participant.inView}
                                  isHost={isHost}/>
            </Grid>
          })}
        </React.Fragment>
      </Grid>
    )
  };

  function renderOverflowGrid() {
    let sortedOverflowGrid = overflowGrid.sort(function (a, b) {
      return b.active - a.active
    });
    console.log("\n\n\n\n\n\n\n\nRENDERING OFG : , ", overflowGrid);
    return sortedOverflowGrid && sortedOverflowGrid.length > 0 &&
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
        {sortedOverflowGrid.map((participant, index) => {
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
                                soundMonitor={(userId, active) => {
                                  //participants.find((p) => p.userId === userId).active = active;
                                  //setRefresher(!refresher);
                                }}
                                onHostAudioMute={() => props.onHostAudioMute(participant)}
                                onHostVideoMute={() => props.onHostVideoMute(participant)}
                                userStream={userStream}
                                isHost={isHost}
                                showName={!participant.isCurrentUser}
                                videoMuted={participant.videoMuted}
                                audioMuted={participant.audioMuted} sizing={'sm'}
                                inView={participant.inView}
                                active={participant.active}/>
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
              height: step === "LOBBY" ? null : 'calc(100% - 152px)',
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
            <div className={'row'} style={{width: '100%', height: '88px', marginLeft: '0', marginRight: '0'}}>
              <div className={'col'}
                   style={{width: 'calc(100% - 200px)', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '0'}}>
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
                                      active={currentUserParticipant.active}
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
            <div className={'col'}
                 style={{width: 'calc(100% - 200px)', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '0'}}>
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
                                    active={currentUserParticipant.active}
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
