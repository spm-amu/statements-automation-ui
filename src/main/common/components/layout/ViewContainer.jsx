import React, {useRef} from 'react';

import {useLocation, useParams} from 'react-router-dom';
import Calendar from '../view/Calendar';
import Chats from '../view/Chats';
import Files from '../view/Files';
import MeetingHistory from '../view/MeetingHistory';
import Meeting from '../view/Meeting';
import JoinMeetingSettings from '../view/JoinMeetingSettings';
import MeetingRoom from '../view/MeetingRoom';
import People from "../view/People";

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const currentView = useRef(null);
  const ref = useRef();
  const activeMeetingDetails = useRef(null);
  const minimizeMaximizeViewSwitch = useRef(0);

  const renderView = () => {
    let viewId = params.id;
    let element;

    if (viewId !== currentView) {
      minimizeMaximizeViewSwitch.current++;
    }

    if (viewId === 'meetingRoom' && currentView.current !== 'joinMeetingSettings') {
      // Do not navigate
      viewId = currentView.current;
    } else {
      if (viewId !== 'meetingRoom') {
        currentView.current = viewId;
      } else {
        minimizeMaximizeViewSwitch.current = 0;
        activeMeetingDetails.current = location.state;
      }
    }

    switch (viewId) {
      case 'calendar':
        element = <Calendar/>;
        break;
      case 'chats':
        element = <Chats/>;
        break;
      case 'meetingHistory':
        element = <MeetingHistory/>;
        break;
      case 'files':
        element = <Files/>;
        break;
      case 'meeting':
        element = <Meeting selectedEvent={location.state}/>;
        break;
      case 'joinMeetingSettings':
        element = <JoinMeetingSettings selectedMeeting={location.state}/>;
        break;
      case 'meetingRoom':
        element = <Calendar/>;
        break;
      case 'people':
        element = <People/>;
        break;
    }

    return <>
      {
        element
      }
      {
        activeMeetingDetails.current &&
        <div style={{visibility: 'hidden', width: '100%', height: '100%'}} ref={ref}>
          <MeetingRoom
            closeHandler={() => {
              activeMeetingDetails.current = null;
              minimizeMaximizeViewSwitch.current = 0;
            }}
            viewSwitch={minimizeMaximizeViewSwitch.current}
            selectedMeeting={activeMeetingDetails.current.selectedMeeting}
            videoMuted={activeMeetingDetails.current.videoMuted}
            audioMuted={activeMeetingDetails.current.audioMuted}
            isHost={activeMeetingDetails.current.isHost}
          />
        </div>
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
