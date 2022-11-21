import React, {useEffect, useState} from 'react';

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

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const [currentWindow, setCurrentWindow] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [currentDisplayMode, setCurrentDisplayMode] = useState('inline');
  const [windowMinimizable, setWindowMinimizable] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [windowDisplayState, setWindowDisplayState] = useState('MAXIMIZED');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentDisplayMode === 'window') {
      setWindowOpen(true);
    }
  }, [currentDisplayMode]);

  const renderView = () => {
    let viewId = params.id;
    let element;
    let data = location.state;
    let displayMode = null;

    if (data) {
      displayMode = data.displayMode;
    }

    if (!displayMode) {
      displayMode = 'inline';
    }

    if (displayMode !== currentDisplayMode) {
      setCurrentDisplayMode(displayMode);
    }

    if (displayMode === 'inline' && viewId !== currentView) {
      setCurrentView(viewId);
      if(windowOpen) {
        setWindowDisplayState('MINIMIZED');
      }
    }

    if (displayMode === 'window' && viewId !== currentWindow) {
      setCurrentWindow(viewId);
    }

    if (data !== currentMeeting && viewId === 'meetingRoom') {
      setCurrentMeeting(data);
      appManager.add('CURRENT_MEETING', data);
    }

    switch (currentView) {
      case 'calendar':
        element = <Calendar/>;
        break;
      case 'chats':
        element = <Chats selectedMeeting={location.state}/>;
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
        element = <People/>;
        break;
    }

    return <>
      {
        element
      }
      {
        currentWindow === 'meetingRoom' && currentMeeting &&
        <Window minimizable={true} open={windowOpen}
                displayState={windowDisplayState} onDisplayModeChange={
                  (mode) => {
                    setWindowDisplayState(mode);
                    let meetingContainer = document.getElementsByClassName('meeting-window-container')[0];
                    meetingContainer.style.overflowY = mode === 'MINIMIZED' ? 'hidden' : 'auto';
                    if(currentView === 'joinMeetingSettings') {
                      navigate('/view/calendar');
                    }
                  }
                }>
          <MeetingRoom
            closeHandler={() => {
              if(currentView === 'joinMeetingSettings') {
                navigate('/view/calendar');
              }
            }}
            onEndCall={() => {
              setWindowOpen(false);
              setCurrentDisplayMode('inline');
              setWindowDisplayState('MAXIMIZED');
              setCurrentWindow(null);
              setCurrentMeeting(null);
              appManager.remove('CURRENT_MEETING');
            }}
            displayState={windowDisplayState}
            selectedMeeting={currentMeeting.selectedMeeting}
            videoMuted={currentMeeting.videoMuted}
            audioMuted={currentMeeting.audioMuted}
            isHost={currentMeeting.isHost}
            isDirectCall={currentMeeting.isDirectCall}
            userToCall={currentMeeting.userToCall}
          />
        </Window>
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
