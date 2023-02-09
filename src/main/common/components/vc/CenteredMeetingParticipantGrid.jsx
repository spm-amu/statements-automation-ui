/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect} from 'react';
import './CenteredMeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";
import LobbyWaitingList from "./LobbyWaitingList";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import appManager from "../../../common/service/AppManager";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const MAX_TILES = 6;

const MeetingParticipantGrid = (props) => {
  const {participants} = props;
  const [grid, setGrid] = React.useState(null);
  const [overflowGrid, setOverflowGrid] = React.useState(null);
  const {
    waitingList,
    mode,
    userVideo,
    videoMuted,
    audioMuted
  } = props;

  useEffect(() => {
    if (participants) {
      let currentUserParticipant = participants.find((p) => p.isCurrentUser);
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

        participants.splice(0, 0, currentUserParticipant);
      }
    }

    console.log("\n\n\nPARTS : ", participants);
    let gridData = createGrid();
    setGrid(gridData.mainGrid);
    setOverflowGrid(gridData.overflowGrid);
  }, [participants, props.mode, props.screenShared]);

  const createGrid = () => {
    let itemGrid = {
      mainGrid: [],
      overflowGrid: []
    };

    let numRows = participants.length < MAX_ROWS ? participants.length : MAX_ROWS;

    if (props.screenShared) {
      numRows = 1;
    }

    if (mode === 'DEFAULT') {
      for (let i = 0; i < numRows; i++) {
        itemGrid.mainGrid.push([]);
      }
    }

    let currentRowIndex = 0;
    let maxTiles = props.screenShared ? 1 : MAX_TILES;
    for (let i = 0; i < participants.length; i++) {
      if (i < maxTiles && mode === 'DEFAULT') {
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
        style={{height: props.screenShared ? "100%" : null,}}
        direction="row"
        justifyContent="center"
        alignItems="center" container item spacing={2}>
        <React.Fragment>
          {row.map((participant, index) => {
            return <Grid item xs={4} key={index} style={
              {
                borderRadius: '4px',
                width: props.screenShared ? "100%" : "33vh",
                height: props.screenShared ? "100%" : "33vh",
                maxHeight: props.screenShared ? "100%" : "33vh",
                flexBasis: props.screenShared ? "100%" : null,
                maxWidth: props.screenShared ? "100%" : null
              }
            }
            >
              <MeetingParticipant data={participant}
                                  refChangeHandler={
                                    participant.isCurrentUser ? (ref) => {
                                      props.userVideoChangeHandler(ref);
                                    } : null
                                  }
                                  showName={!participant.isCurrentUser} videoMuted={participant.videoMuted}
                                  audioMuted={participant.audioMuted}/>
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
          height: !props.screenShared ? '96%' : null,
          borderRadius: '4px',
          overflowY: 'hidden',
          margin: props.screenShared || mode === 'STRIP' ? "0" : "12px 8px",
          backgroundColor: 'rgb(40, 40, 43)',
          display: 'flex',
          alignItems: 'center'
        }}
        className="row flex-row flex-nowrap">
        {overflowGrid.map((participant, index) => {
          return <div className={'col-*-*'} key={index}
                      style={{
                        borderRadius: '4px',
                        minWidth: "100px",
                        width: "100px",
                        height: "100px",
                        marginRight: '8px'
                      }}>
            <MeetingParticipant data={participant}
                                refChangeHandler={
                                  participant.isCurrentUser ? (ref) => {
                                    props.userVideoChangeHandler(ref);
                                  } : null
                                }
                                showName={!participant.isCurrentUser}
                                videoMuted={participant.videoMuted}
                                audioMuted={participant.audioMuted} sizing={'sm'}/>
          </div>
        })}
      </div>;
  }

  return (
    grid !== null ?
      <div className={'row grid'}
           style={{height: mode === 'DEFAULT' ? '100%' : null, width: '100%'}}>
        {grid && grid.length > 0 &&
        <Box sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          padding: '32px'
        }}>
          <Grid container spacing={2} style={{width: '100%', height: props.screenShared ? "100%" : null}}>
            {grid.map((row, index) => {
              return <>
                {
                  props.screenShared ?
                    <div key={index} style={{width: '100%', height: props.screenShared ? "calc(75% + 40px)" : null}}>
                      {
                        renderRow(row, index)
                      }
                    </div>
                    :
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
