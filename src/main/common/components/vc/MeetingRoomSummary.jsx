/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from "react";
import InCallCard from "./InCallCard";

const MeetingRoomSummary = (props) => {

  const [label, setLabel] = useState('');

  const {participants, participantsRaisedHands} = props;

  const {
    waitingList
  } = props;

  return (
    participants && participantsRaisedHands &&
    <div style={{height: '160px', maxHeight: '160px', width: '100%', overflow: 'auto'}}>
      <div>
        {participants.map((participant, index) => {
          return <InCallCard key={index} participant={participant} maxWidth={'700px'} borderBottom={'none'}
                             raisedHands={participantsRaisedHands.filter((p) => p.userId === participant.userId).length > 0}/>
        })}
      </div>
    </div>
  );
};

export default MeetingRoomSummary;
