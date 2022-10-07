import React, {useRef, useState} from 'react';

import {useLocation, useParams} from 'react-router-dom';
import Calendar from '../view/Calendar';
import Chats from '../view/Chats';
import Files from '../view/Files';
import MeetingHistory from '../view/MeetingHistory';
import Meeting from '../view/Meeting';
import JoinMeetingSettings from '../view/JoinMeetingSettings';
import MeetingRoom from '../view/MeetingRoom';

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const currentView = useRef(null);
  const activeMeetingDetails = useRef(null);

  const renderView = () => {
    let viewId = params.id;
    let element;


    if (viewId === 'meetingRoom' && currentView.current !== 'joinMeetingSettings') {
      // Do not navigate
      viewId = currentView.current;
    } else {
      if(viewId !== 'meetingRoom') {
        currentView.current = viewId;
      } else {
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
      case 'files':element = <Files/>;
        break;
      case 'meeting':
        element = <Meeting selectedEvent={location.state}/>;
        break;
      case 'joinMeetingSettings':
        element = <JoinMeetingSettings selectedMeeting={location.state}/>;
        break;
      case 'meetingRoom':
        element = <div/>;
        break;
        /*return (
          {<MeetingRoom
            selectedMeeting={location.state.selectedMeeting}
            videoMuted={location.state.videoMuted}
            audioMuted={location.state.audioMuted}
            isHost={location.state.isHost}
          />}
        );*/
    }


    return <>
      {
        element
      }
      <div style={{visibility: 'hidden', width: '100%', height: '100%', border: '4px solid blue'}}>
        {
          activeMeetingDetails.current &&
          <MeetingRoom
            selectedMeeting={activeMeetingDetails.current.selectedMeeting}
            videoMuted={activeMeetingDetails.current.videoMuted}
            audioMuted={activeMeetingDetails.current.audioMuted}
            isHost={activeMeetingDetails.current.isHost}
          />
        }
      </div>
    </>
  };

  return renderView();
};


export default ViewContainer;
