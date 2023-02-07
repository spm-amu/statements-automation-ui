import React, {useEffect, useState} from "react";
import MeetingParticipantGrid from "../vc/CenteredMeetingParticipantGrid";

const TestView = (props) => {

  const [participants, setParticipants] = useState([]);
  const [lobbyWaitingList] = useState(null);
  const [meetingParticipantGridMode] = useState('AUTO_ADJUST');

  useEffect(() => {
    let users = [];
    for (let i=0;i<30;i++) {
      let user = {
        userId: 'test-' + i,
        peer: null,
        name: "TEST " + i,
        avatar: null,
        audioMuted: true,
        videoMuted: true
      };

      users.push(user);
    }

    setParticipants(users);
  }, []);

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto'}}>
      {
        participants &&
        <MeetingParticipantGrid participants={participants}
                                waitingList={lobbyWaitingList}
                                mode={meetingParticipantGridMode}
                                screenShared={true}
                                acceptUserHandler={
                                  (item) => {
                                    acceptUser(item);
                                  }}
                                rejectUserHandler={
                                  (item) => {
                                    rejectUser(item);
                                  }}/>
      }
    </div>
  );
};

export default TestView;
