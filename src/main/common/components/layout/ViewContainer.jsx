import React from 'react';

import { useParams } from 'react-router-dom';
import Calendar from '../view/Calendar';
import Chats from '../view/Chats';
import Files from '../view/Files';
import MeetingHistory from '../view/MeetingHistory';
import Meeting from "../view/Meeting";
import {useLocation} from 'react-router-dom';
import JoinMeetingSettings from "../view/JoinMeetingSettings";
import MeetingRoom from "../view/MeetingRoom";
import MeetingRoomSession from '../view/MeetingRoomSession';

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();

  const renderView = () => {
    const viewId = params.id;

    switch (viewId) {
      case 'calendar':
        return <Calendar/>;
      case 'chats':
        return <Chats />;
      case 'meetingHistory':
        return <MeetingHistory />;
      case 'files':
        return <Files />;
      case 'meeting':
        return <Meeting selectedEvent={location.state}/>;
      case 'joinMeetingSettings':
        return <JoinMeetingSettings selectedMeeting={location.state}/>;
      case 'meetingRoom':
        return <MeetingRoomSession selectedMeeting={location.state.selectedMeeting} settings={location.state.settings} isHost={location.state.isHost} />;
      // case 'meetingRoom':
      //   return <MeetingRoom selectedMeeting={location.state.selectedMeeting} settings={location.state.settings}/>;
    }

    return null;
  };

  return renderView();
};

export default ViewContainer;
