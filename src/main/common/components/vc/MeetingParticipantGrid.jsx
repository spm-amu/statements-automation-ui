/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useRef} from 'react';
import './MeetingParticipantGrid.css';
import MeetingParticipant from "./MeetingParticipant";

const MAX_COLS = 2;
const MAX_ROWS = 3;
const MAX_TILES = 6;

const MeetingParticipantGrid = (props) => {
  const videoRef = useRef();
  const {participants} = props;
  const [grid, setGrid] = React.useState(null);
  const [sideGrid, setSideGrid] = React.useState(null);

  useEffect(() => {
    let gridData = createGrid();
    setGrid(gridData.mainGrid);
    setSideGrid(gridData.sideGrid);
  }, []);

  const createColumn = (index) => {
    let col = [];
    for (let i = index; i < participants.length && col.length < MAX_ROWS; i++) {
      col.push(participants[i]);
    }

    return col;
  };

  const createGrid = () => {
    let itemGrid = {
      mainGrid: [],
      sideGrid: []
    };

    let pos = 0;

    let maxGridSize = MAX_COLS * MAX_ROWS;
    let numCols = participants.length < MAX_COLS ? participants.length : MAX_COLS;

    for (let i = 0; i < numCols; i++) {
      itemGrid.mainGrid.push([]);
    }

    let currentColIndex = 0;
    for (let i = 0; i < participants.length; i++) {
      if (i < MAX_TILES) {
        itemGrid.mainGrid[currentColIndex].push(participants[i]);
        if (currentColIndex++ === MAX_COLS - 1) {
          currentColIndex = 0;
        }
      } else {
        itemGrid.sideGrid.push(participants[i]);
      }
    }

    return itemGrid;
  };

  const renderColumn = (col, index) => {
    return (
      <div className={'col item'} key={index}>
        {col.map((participant, index) => {
          return <div style={{height: ((100 / col.length)) + '%'}} key={index}>
            <MeetingParticipant data={participant} showName={true} videoMuted={props.videoMuted} />
          </div>
        })}
      </div>
    )
  };

  return (
    grid !== null ?
      <div className={'row grid'} style={{height: 'calc(100% - 16px)'}}>
        <div className={'col h-100'}>
          <div className={'row h-100'}>
            {grid.map((col, index) => {
              return <Fragment key={index}>
                {
                  renderColumn(col, index)
                }
              </Fragment>
            })}
          </div>
        </div>
        {
          sideGrid && sideGrid.length > 0 &&
          <div className={'no-side-margin no-side-padding grid-side-bar'} style={{backgroundColor: 'transparent'}}>
            {sideGrid.map((participant, index) => {
              return <div key={index} className={'side-grid-item'}>
                <MeetingParticipant data={participant} videoMuted={props.videoMuted} showName={true} padding={'0'}/>
              </div>
            })}
          </div>
        }
      </div>
      :
      null
  )
};

export default MeetingParticipantGrid;