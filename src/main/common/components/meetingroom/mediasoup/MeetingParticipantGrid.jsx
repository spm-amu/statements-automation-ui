/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import './MeetingParticipantGrid.css';
import LobbyWaitingList from "../LobbyWaitingList";
import Lobby from "../Lobby";

const MAX_COLS = 3;
const MAX_ROWS = 2;
const VH = 60;

const MeetingParticipantGrid = (props) => {
  const [inViewParticipants, setInViewParticipants] = React.useState([]);
  const [activeOffViewParticipants, setActiveOffViewParticipants] = React.useState([]);
  const [grid, setGrid] = React.useState(null);
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

  useEffect(() => {
    if (props.participants && props.mode) {
      setupGrid();
    }
  }, [props.participants, props.mode]);

  const setupGrid = () => {
    let counter = 0;
    for (const participant of props.participants) {
      inViewParticipants.push(participant);
      if(counter++ >= MAX_ROWS * MAX_COLS) {
        break;
      }
    }

    let inViewGrid = [];
    let numRows = inViewParticipants.length < MAX_ROWS ? inViewParticipants.length : MAX_ROWS;
    let rows = inViewParticipants.length === 2 ? 1 : numRows;

    for (let i = 0; i < rows; i++) {
      inViewGrid.push([]);
    }

    let currentRowIndex = 0;
    for (let i = 0; i < props.participants.length; i++) {
      inViewGrid.push(props.participants[i]);
      if (currentRowIndex++ === rows - 1) {
        currentRowIndex = 0;
      }
    }

    setGrid(inViewGrid);
  };

  return (
    grid !== null ?
      <div className={'row grid'}
           style={{height: mode === 'DEFAULT' ? '100%' : null, width: '100%', border: '2px solid white'}}>
        {
          step === "LOBBY" &&
          <Lobby isHost={isHost} autoPermit={autoPermit} userToCall={props.userToCall} displayState={props.displayState}
                 meetingTitle={props.meetingTitle}/>
        }
        {
          grid && mode === 'DEFAULT' && step !== "LOBBY" &&
          <>
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
      </div>
      :
      null
  )
};

export default MeetingParticipantGrid;
