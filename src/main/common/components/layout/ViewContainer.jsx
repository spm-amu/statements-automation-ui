import React, {useState} from 'react';

import {useLocation, useNavigate, useParams} from 'react-router-dom';
import Calendar from '../view/Calendar';
import Chats from '../view/Chats';
import Files from '../view/Files';
import MeetingHistory from '../view/MeetingHistory';
import Meeting from '../view/Meeting';
import JoinMeetingSettings from '../view/JoinMeetingSettings';
import People from "../view/People";
import MeetingRoom from "../view/MeetingRoom";
import Window from "../Window";
import appManager from "../../../common/service/AppManager";
import "./ViewContainer.css"
import Activity from "../view/Activity";
import WhiteboardView from "../view/WhiteboardView";
import MeetingRoomToolbar from "../vc/MeetingRoomToolbar";

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const [attributes] = useState({
    currentWindow: null,
    currentView: null,
    data: null,
    currentDisplayMode: 'inline',
    windowClosing: false,
    windowDisplayState: 'MAXIMIZED',
    windowToolbarDisplayState: 'HIDDEN',
  });

  const [windowOpen, setWindowOpen] = useState(null);
  const [refresher, setRefresher] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    return () => {
      appManager.remove('CURRENT_MEETING');
      attributes.data = null;
    };
  }, []);

  React.useEffect(() => {
    if (windowOpen !== null && windowOpen === false) {
      attributes.currentDisplayMode = 'inline';
      attributes.windowClosing = true;
      attributes.windowToolbarDisplayState = 'HIDDEN';
    }
  }, [windowOpen]);

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

    if (!attributes.windowClosing) {
      if (displayMode !== attributes.currentDisplayMode) {
        if (displayMode === 'window') {
          setWindowOpen(true);
        }

        attributes.currentDisplayMode = displayMode;
      }

      attributes.windowClosing = false;
      if (displayMode === 'inline' && viewId !== attributes.currentView) {
        attributes.currentView = viewId;
        if (windowOpen) {
          attributes.windowDisplayState = 'MINIMIZED';
        }
      }

      if (displayMode === 'window' && viewId !== attributes.currentWindow) {
        attributes.currentWindow = viewId;
      }

      if (data !== attributes.data && viewId === 'meetingRoom') {
        attributes.data = data;
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
        case 'whiteboard':
          element = <WhiteboardView id={location.state}/>;
          break;
        case 'people':
          element = <People dialEnabled={true} chatEnabled={false}/>;
          break;
        case 'activity':
          element = <Activity/>;
          break;
      }
    } else {
      attributes.windowClosing = false;
    }

    return <>
      {
        element
      }
      {
        attributes.currentWindow === 'meetingRoom' && attributes.data && windowOpen &&
        <Window minimizable={true} open={windowOpen} toolbar={
          <MeetingRoomToolbar
            isHost={attributes.data.isHost}
            isDirectCall={attributes.data.isDirectCall}
            selectedMeeting={attributes.data.selectedMeeting}
          />
        }
                title={attributes.data.selectedMeeting.title}
                containerClassName={'meeting-window-container'}
                toolbarDisplayState={attributes.windowToolbarDisplayState}
                displayState={attributes.windowDisplayState} onDisplayModeChange={
          (mode) => {
            attributes.windowDisplayState = mode;
            let meetingContainer = document.getElementsByClassName('meeting-window-container')[0];
            meetingContainer.style.overflowY = mode === 'MINIMIZED' ? 'hidden' : 'auto';
            if (attributes.currentView === 'joinMeetingSettings') {
              navigate('/view/calendar');
            }

            setRefresher(!refresher);
          }
        }>
          <MeetingRoom
            windowHandler={
              {
                show: () => {
                  attributes.windowToolbarDisplayState = 'VISIBLE';
                  setRefresher(!refresher);
                },
                hide: () => {
                  attributes.windowToolbarDisplayState = 'HIDDEN';
                  setRefresher(!refresher);
                }
              }
            }
            closeHandler={() => {
              if (attributes.currentView === 'joinMeetingSettings') {
                navigate('/view/calendar');
              }
            }}
            onEndCall={() => {
              appManager.remove('CURRENT_MEETING');

              attributes.windowDisplayState = 'MAXIMIZED';
              attributes.currentWindow = null;
              attributes.data = null;

              setWindowOpen(false);
            }}
            displayState={attributes.windowDisplayState}
            selectedMeeting={attributes.data.selectedMeeting}
            callerUser={attributes.data.callerUser}
            videoMuted={attributes.data.videoMuted}
            audioMuted={attributes.data.audioMuted}
            isHost={attributes.data.isHost}
            autoPermit={attributes.data.autoPermit}
            isDirectCall={attributes.data.isDirectCall}
            userToCall={attributes.data.userToCall}
          />
        </Window>
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
