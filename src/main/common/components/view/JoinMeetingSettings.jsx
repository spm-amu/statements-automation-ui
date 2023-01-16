import React from "react";
import MeetingSettingsComponent from "../vc/MeetingSettingsComponent";

const JoinMeetingSettings = (props) => {

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto'}}>
      <MeetingSettingsComponent {...props}/>
    </div>
  );
};

export default JoinMeetingSettings;
