/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import InCallCard from "./InCallCard";

const MeetingRoomSummary = (props) => {
  const {participants} = props;

  return (
    participants &&
    <div style={{height: '100%', maxHeight: '100%', width: '100%', overflow: 'auto'}}>
      <div>
        {participants.map((participant, index) => {
          return <InCallCard key={index} participant={participant} maxWidth={'700px'} borderBottom={'none'}/>
        })}
      </div>
    </div>
  );
};

export default MeetingRoomSummary;
