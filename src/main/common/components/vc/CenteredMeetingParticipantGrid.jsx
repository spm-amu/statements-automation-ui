/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useRef} from 'react';
import './CenteredMeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";
import LobbyWaitingList from "./LobbyWaitingList";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const MAX_TILES = 6;

const MeetingParticipantGrid = (props) => {
  const videoRef = useRef();
  const {participants} = props;
  const [grid, setGrid] = React.useState(null);
  const [overflowGrid, setOverflowGrid] = React.useState(null);
  const {
    waitingList,
    mode
  } = props;

  useEffect(() => {
    let gridData = createGrid();
    setGrid(gridData.mainGrid);
    setOverflowGrid(gridData.overflowGrid);
  }, [participants, mode]);

  const createGrid = () => {
    let itemGrid = {
      mainGrid: [],
      overflowGrid: []
    };

    let numRows = participants.length < MAX_ROWS ? participants.length : MAX_ROWS;

    if(props.screenShared) {
      numRows = 1;
    }

    if (mode === 'AUTO_ADJUST') {
      for (let i = 0; i < numRows; i++) {
        itemGrid.mainGrid.push([]);
      }
    }

    let currentRowIndex = 0;
    let maxTiles = props.screenShared ? 1 : MAX_TILES;
    for (let i = 0; i < participants.length; i++) {
      if (i < maxTiles && mode === 'AUTO_ADJUST') {
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
              <MeetingParticipant data={participant} showName={true} videoMuted={participant.videoMuted}
                                  audioMuted={participant.audioMuted}/>
            </Grid>
          })}
        </React.Fragment>
      </Grid>
    )
  };

  return (
    grid !== null ?
      <div className={'row grid'}
           style={{height: '100%', width: mode === 'AUTO_ADJUST' ? '100%' : '256px'}}>
        {grid && grid.length > 0 &&
        <Box sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          padding: '0px 32px'
        }}>
          <Grid container spacing={2} style={{width: '100%', height: props.screenShared ? "100%" : null}}>
            {grid.map((row, index) => {
              return <div key={index} style={{width: '100%', height: props.screenShared ? "80%" : null, border: '4px solid red'}}>
                {
                  renderRow(row, index)
                }
              </div>
            })}
            {
              overflowGrid && overflowGrid.length > 0 &&
              <div
                style={{
                  overflowX: 'auto',
                  maxWidth: '100%',
                  borderRadius: '4px',
                  margin: "12px 8px",
                  backgroundColor: 'rgb(40, 40, 43)'
                }}
                className="row flex-row flex-nowrap">
                {overflowGrid.map((participant, index) => {
                  return <div className={'col'} key={index}
                              style={{borderRadius: '4px', minWidth: "16vh", height: "16vh", marginRight: '8px'}}>
                    <MeetingParticipant data={participant} showName={true} videoMuted={participant.videoMuted}
                                        audioMuted={participant.audioMuted} sizing={'sm'}/>
                  </div>
                })}
              </div>
            }
          </Grid>
        </Box>
        }
        {
          ((waitingList && waitingList.length > 0)) &&
          <div className={'no-side-margin no-side-padding grid-side-bar'} style={{backgroundColor: 'transparent'}}>
            {
              waitingList && waitingList.length > 0 &&
              <LobbyWaitingList waitingList={waitingList}
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
