/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect} from 'react';
import './CenteredMeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";
import LobbyWaitingList from "./LobbyWaitingList";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import appManager from "../../../common/service/AppManager";
import Lobby from "./Lobby";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const MAX_TILES = 1;

const MeetingParticipantGrid = (props) => {
  const [participants, setParticipants] = React.useState([]);
  const [grid, setGrid] = React.useState(null);
  const [overflowGrid, setOverflowGrid] = React.useState(null);
  const [refresher, setRefresher] = React.useState(false);
  const {
    waitingList,
    mode,
    step,
    userStream,
    videoMuted,
    audioMuted,
    isHost,
    autoPermit,
    meetingTitle
  } = props;

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

        currentUserParticipant.active = true;
        currentUserParticipant.inView = true;
        newParticipants.push(currentUserParticipant);
      }

      let i = 1;
      for (const participant of props.participants) {
        if (!participant.isCurrentUser) {
          newParticipants.push(participant);
        } else {
          participant.active = true;
          participant.inView = true;
        }

        if(i++ < MAX_TILES) {
          participant.active = true;
          participant.inView = true;
        }
      }

      console.log("\n\n\nPARTS : ", newParticipants);

      setParticipants(newParticipants);
      let gridData = createGrid(newParticipants);
      setGrid(gridData.mainGrid);
      setOverflowGrid(gridData.overflowGrid);
    }
  }, [props.participants, props.mode]);

  const createGrid = (participants) => {
    let itemGrid = {
      mainGrid: [],
      overflowGrid: []
    };

    let numRows = participants.length < MAX_ROWS ? participants.length : MAX_ROWS;
    if (mode === 'DEFAULT') {
      for (let i = 0; i < numRows; i++) {
        itemGrid.mainGrid.push([]);
      }
    }

    let currentRowIndex = 0;
    for (let i = 0; i < participants.length; i++) {
      if (mode === 'DEFAULT' && participants[i].inView) {
        itemGrid.mainGrid[currentRowIndex].push(participants[i]);
        if (currentRowIndex++ === MAX_ROWS - 1 || participants.length === 2) {
          currentRowIndex = 0;
        }
      } else {
        itemGrid.overflowGrid.push(participants[i]);
      }
    }

    return itemGrid;
  };

  const renderRow = (row, index) => {
    return (
      <Grid
        style={{height: null,}}
        direction="row"
        justifyContent="center"
        alignItems="center" container item spacing={2}>
        <React.Fragment>
          {row.map((participant, index) => {
            return <Grid item xs={4} key={index} className={'meetingParticipantContainer'} style={
              {
                borderRadius: '4px',
                width: "33vh",
                height: "33vh",
                maxHeight: "33vh",
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
          height: '96%',
          borderRadius: '4px',
          overflowY: 'hidden',
          margin: mode === 'STRIP' ? "0" : "12px 8px",
          backgroundColor: 'rgb(40, 40, 43)',
          alignItems: 'center'
        }}
        className="row flex-row flex-nowrap">
        {overflowGrid.map((participant, index) => {
          return <div className={'col-*-*'} key={index}
                      style={{
                        borderRadius: '4px',
                        height: "120px",
                        maxHeight: "120px",
                        minWidth: "200px",
                        padding: '4px'
                      }}>
            <MeetingParticipant data={participant}
                                refChangeHandler={
                                  participant.isCurrentUser ? (ref) => {
                                    props.userVideoChangeHandler(ref);
                                  } : null
                                }
                                soundMonitor={(userId, active) => {
                                  participants.find((p) => p.userId === userId).active = active;
                                  setRefresher(!refresher);
                                }}
                                onHostAudioMute={() => props.onHostAudioMute(participant)}
                                onHostVideoMute={() => props.onHostVideoMute(participant)}
                                userStream={userStream}
                                isHost={isHost}
                                showName={!participant.isCurrentUser}
                                videoMuted={participant.videoMuted}
                                audioMuted={participant.audioMuted} sizing={'sm'}
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
          <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={props.userToCall} displayState={props.displayState} meetingTitle={props.meetingTitle}/>
        }
        {
          grid && grid.length > 0 &&
          <Box sx={{
            flexGrow: 1,
            height: step === "LOBBY" ? null : '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            padding: '32px'
          }}>
            <Grid container spacing={2} style={{width: '100%'}}>
              {grid.map((row, index) => {
                return <>
                  {
                      <Fragment key={index}>
                        {
                          renderRow(row, index)
                        }
                      </Fragment>
                  }
                </>
              })}
              {
                renderOverflowGrid()
              }
            </Grid>
          </Box>
        }
        {
          mode === 'STRIP' &&
          <div style={{width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
            {
              renderOverflowGrid()
            }
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
