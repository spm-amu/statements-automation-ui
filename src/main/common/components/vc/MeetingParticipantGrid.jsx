/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from "react";
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
    console.log("CREATE COL : " + index);
    let col = [];
    for (let i = index; i < participants.length && col.length < MAX_ROWS; i++) {
      col.push(participants[i]);
    }

    console.log("LEN : " + col.length);
    return col;
  };

  const createGrid = () => {
    let itemGrid = [];
    let pos = 0;

    let maxGridSize = MAX_COLS * MAX_ROWS;
    let numCols = participants.length < MAX_COLS ? participants.length : MAX_COLS;
    //let gridSize = participants.length <= maxGridSize ? maxGridSize : participants.length;

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

    console.log("GRID SIZE : " + itemGrid.length);
    console.log(itemGrid);

    return itemGrid;
  };

  const renderColumn = (col, index) => {
    return (
      <div className={'col item'}>
        {col.map((participant, index) => {
          return <div style={{height: 100 / col.length + '%'}}>
            <MeetingParticipant data={participant} key={index}/>
          </div>
        })}
      </div>
    )
  };

  return (
    grid !== null ?
      <div className={'row grid'}>
        {grid.map((col, index) => {
          return <>
            {
              renderColumn(col, index)
            }
          </>
        })}
      </div>
      :
      null
  )

};

export default MeetingParticipantGrid;


//{/*<MeetingParticipant data={participant} key={index}/>*/}
