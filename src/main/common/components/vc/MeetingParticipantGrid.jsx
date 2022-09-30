/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useEffect, useRef } from 'react';
import './MeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";

const MAX_COLS = 2;
const MAX_ROWS = 3;

const MeetingParticipantGrid = (props) => {
  const videoRef = useRef();
  const {participants} = props;
  const [grid, setGrid] = React.useState(null);

  useEffect(() => {
    setGrid(createGrid());
  }, []);

  const createColumn = (index) => {
    let col = [];
    for (let i = index; i < participants.length && col.length < MAX_ROWS; i++) {
      col.push(participants[i]);
    }

    return col;
  };

  const createGrid = () => {
    let itemGrid = [];
    let pos = 0;

    let maxGridSize = MAX_COLS * MAX_ROWS;
    let numCols = participants.length < MAX_COLS ? participants.length : MAX_COLS;

    for (let i = 0; i < numCols; i++) {
      itemGrid.push([]);
    }

    let currentColIndex = 0;
    for (let i = 0; i < participants.length; i++) {
      itemGrid[currentColIndex].push(participants[i]);
      if(currentColIndex++ === MAX_COLS - 1) {
        currentColIndex = 0;
      }
    }

    return itemGrid;
  };

  const renderColumn = (col, index) => {
    return (
      <div className={'col item'} key={index}>
        {col.map((participant, index) => {
          return <div style={{height: ((100 / col.length)) + '%'}} key={index}>
            <MeetingParticipant data={participant} showName={true}/>
          </div>
        })}
      </div>
    )
  };

  return (
    grid !== null ?
      <div className={'row grid'} style={{height: 'calc(100% - 16px)'}}>
        {grid.map((col, index) => {
          return <Fragment key={index}>
            {
              renderColumn(col, index)
            }
          </Fragment>
        })}
      </div>
      :
      null
  )
};

export default MeetingParticipantGrid;
