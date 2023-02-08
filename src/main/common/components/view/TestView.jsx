import React, {useEffect, useState} from "react";
import MeetingParticipantGrid from "../vc/CenteredMeetingParticipantGrid";

const TestView = (props) => {

  const [participants, setParticipants] = useState([]);
  const [lobbyWaitingList] = useState([]);
  const [meetingParticipantGridMode] = useState('STRIP');

  useEffect(() => {
    let users = [];
    for (let i=0;i<1;i++) {
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
    //lobbyWaitingList.push({});
  }, []);

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto'}}>
      {
        participants &&
        <MeetingParticipantGrid participants={participants}
                                waitingList={lobbyWaitingList}
                                mode={meetingParticipantGridMode}
                                screenShared={true}
                                videoMuted={true}
                                audioMuted={true}
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
