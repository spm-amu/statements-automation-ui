import React, {useEffect, useRef, useState} from 'react';

import {useLocation, useParams} from 'react-router-dom';
import Calendar from '../view/Calendar';
import Chats from '../view/Chats';
import Files from '../view/Files';
import MeetingHistory from '../view/MeetingHistory';
import Meeting from '../view/Meeting';
import JoinMeetingSettings from '../view/JoinMeetingSettings';
import People from "../view/People";
import MeetingRoom from "../view/MeetingRoom";
import Window from "../Window";
import {useNavigate} from 'react-router-dom';
import appManager from "../../../common/service/AppManager";
import "./ViewContainer.css"

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const [attributes] = useState({
    currentWindow: null,
    currentView: null,
    currentMeeting: null,
    currentDisplayMode: 'inline',
    windowDisplayState: 'MAXIMIZED',
  });

  const [windowOpen, setWindowOpen] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    return () => {
      appManager.remove('CURRENT_MEETING');
      attributes.currentMeeting = null;
    };
  }, []);


  React.useEffect(() => {
    if(!windowOpen) {
      attributes.currentDisplayMode = 'inline';
    }
  }, [windowOpen]);

  const renderView = () => {
    let viewId = params.id;
    let element;
    let data = location.state;
    let displayMode = null;

    console.log("\n\n\nVC PROPS");
    console.log(attributes);
    console.log("WINDOW OPEN : " + windowOpen);

    if (data) {
      displayMode = data.displayMode;
    }

    if (!displayMode) {
      displayMode = 'inline';
    }

    if (displayMode !== attributes.currentDisplayMode) {
      attributes.currentDisplayMode = displayMode;
      setWindowOpen(displayMode === 'window');
    }

    if (displayMode === 'inline' && viewId !== attributes.currentView) {
      attributes.currentView = viewId;
      if(windowOpen) {
        attributes.windowDisplayState = 'MINIMIZED';
      }
    }

    if (displayMode === 'window' && viewId !== attributes.currentWindow) {
      attributes.currentWindow = viewId;
    }

    if (data !== attributes.currentMeeting && viewId === 'meetingRoom') {
      attributes.currentMeeting = data;
    }

    switch (attributes.currentView) {
      case 'calendar':
        element = <Calendar/>;
        break;
      case 'chats':
        element = <Chats selected={location.state}/>;
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
      case 'people':
        element = <People dialEnabled={true} chatEnabled={false}/>;
        break;
    }

    return <>
      {
        element
      }
      {
        attributes.currentWindow === 'meetingRoom' && attributes.currentMeeting &&
        <Window minimizable={true} open={windowOpen}
                containerClassName={'meeting-window-container'}
                displayState={attributes.windowDisplayState} onDisplayModeChange={
                  (mode) => {
                    attributes.windowDisplayState = mode;
                    let meetingContainer = document.getElementsByClassName('meeting-window-container')[0];
                    meetingContainer.style.overflowY = mode === 'MINIMIZED' ? 'hidden' : 'auto';
                    if(attributes.currentView === 'joinMeetingSettings') {
                      navigate('/view/calendar');
                    }
                  }
                }>
          <MeetingRoom
            closeHandler={() => {
              if(attributes.currentView === 'joinMeetingSettings') {
                navigate('/view/calendar');
              }
            }}
            onEndCall={() => {
              appManager.remove('CURRENT_MEETING');

              console.log("\n\n\n\nCLOSING WINDOW");

              attributes.windowDisplayState = 'MAXIMIZED';
              attributes.currentWindow = null;
              attributes.currentMeeting = null;

              setWindowOpen(false);
            }}
            displayState={attributes.windowDisplayState}
            selectedMeeting={attributes.currentMeeting.selectedMeeting}
            videoMuted={attributes.currentMeeting.videoMuted}
            audioMuted={attributes.currentMeeting.audioMuted}
            isHost={attributes.currentMeeting.isHost}
            isDirectCall={attributes.currentMeeting.isDirectCall}
            userToCall={attributes.currentMeeting.userToCall}
          />
        </Window>
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
