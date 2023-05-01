import React, {useRef, useState} from 'react';

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
import RecordingView from '../view/RecordingView';
import ChatPollsHistoryView from '../view/ChatPollsHistoryView';
import MeetingRoomSessionEndedView from "../view/MeetingRoomSessionEndedView";

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const attributes = useRef({
    currentWindow: null,
    currentView: null,
    data: null,
    currentDisplayMode: 'inline',
    windowDisplayState: 'MAXIMIZED',
    windowToolbarDisplayState: 'HIDDEN',
  });

  const windowOpen = useRef(null);
  const [refresher, setRefresher] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    return () => {
      appManager.remove('CURRENT_MEETING');
      attributes.current.data = null;
    };
  }, []);

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

    console.log("\n\n\n\n\n\nNAVIGATING TO : ", viewId);
    console.log("CLOSING : " + attributes.current.windowClosing + " : " + displayMode);
    if (displayMode !== attributes.current.currentDisplayMode) {
      if (displayMode === 'window') {
        windowOpen.current = true;
      }

      attributes.current.currentDisplayMode = displayMode;
    }

    attributes.current.windowClosing = false;
    if (displayMode === 'inline' && viewId !== attributes.current.currentView) {
      attributes.current.currentView = viewId;
      if (windowOpen.current) {
        attributes.current.windowDisplayState = 'MINIMIZED';
      }
    }

    if (displayMode === 'window' && viewId !== attributes.current.currentWindow) {
      attributes.current.currentWindow = viewId;
    }

    if (data !== attributes.current.data && (viewId === 'meetingRoom' || viewId === 'meetingRoomSessionEnded')) {
      attributes.current.data = data;
    }

    console.log("ATTRIBUTES : ", attributes.current);
    switch (attributes.current.currentView) {
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
      case 'recordings':
        element = <RecordingView meetingId={location.state}/>;
        break;
      case 'pollsHistory':
        element = <ChatPollsHistoryView meetingId={location.state}/>;
        break;
      case 'people':
        element = <People dialEnabled={true} chatEnabled={false}/>;
        break;
      case 'activity':
        element = <Activity/>;
        break;
    }

    return <>
      {
        element
      }
      {
        attributes.current.currentWindow === 'meetingRoomSessionEnded' && attributes.current.data && windowOpen.current ?
          <Window minimizable={false} open={windowOpen.current}>
            <MeetingRoomSessionEndedView isDirectCall={attributes.current.data.isDirectCall} closeHandler={() => {
              attributes.current.windowDisplayState = 'MAXIMIZED';
              attributes.current.currentWindow = null;
              attributes.current.data = null;

              windowOpen.current = false;

              if (attributes.current.currentView === 'joinMeetingSettings') {
                navigate('/view/calendar');
              } else {
                navigate('/view/' + attributes.current.currentView);
              }
            }}/>
          </Window>
          :
          attributes.current.currentWindow === 'meetingRoom' && attributes.current.data && windowOpen.current &&
          <Window minimizable={true} open={windowOpen.current} toolbar={
            <MeetingRoomToolbar
              isHost={attributes.current.data.isHost}
              isDirectCall={attributes.current.data.isDirectCall}
              selectedMeeting={attributes.current.data.selectedMeeting}
              title={attributes.current.data.selectedMeeting.title}
              startMeetingHandler={() => {
                attributes.current.data.meetingStarted = true;
                setRefresher(!refresher);
              }
              }
            />
          }
                  title={attributes.current.data.selectedMeeting.title}
                  containerClassName={'meeting-window-container'}
                  toolbarDisplayState={attributes.current.windowToolbarDisplayState}
                  displayState={attributes.current.windowDisplayState} onDisplayModeChange={
            (mode) => {
              attributes.current.windowDisplayState = mode;
              let meetingContainer = document.getElementsByClassName('meeting-window-container')[0];
              meetingContainer.style.overflowY = mode === 'MINIMIZED' ? 'hidden' : 'auto';
              if (attributes.current.currentView === 'joinMeetingSettings') {
                navigate('/view/calendar');
              }

              setRefresher(!refresher);
            }
          }>
            <MeetingRoom
              windowHandler={
                {
                  show: () => {
                    attributes.current.windowToolbarDisplayState = 'VISIBLE';
                    setRefresher(!refresher);
                  },
                  hide: () => {
                    attributes.current.windowToolbarDisplayState = 'HIDDEN';
                    setRefresher(!refresher);
                  }
                }
              }
              closeHandler={() => {
              }}
              onEndCall={(isDirectCall, showMessage) => {
                appManager.remove('CURRENT_MEETING');

                console.log("\n\n\n\nSHOW MESSAGE : " + showMessage);
                if (showMessage) {
                  console.log("NAVIGATING TO meetingRoomSessionEnded");
                  navigate("/view/meetingRoomSessionEnded", {
                    state: {
                      displayMode: 'window',
                      isDirectCall: isDirectCall
                    }
                  })
                } else {
                  attributes.current.windowDisplayState = 'MAXIMIZED';
                  attributes.current.currentWindow = null;
                  attributes.current.data = null;

                  windowOpen.current = false;
                  navigate('/view/' + attributes.current.currentView);
                }
              }}
              displayState={attributes.current.windowDisplayState}
              selectedMeeting={attributes.current.data.selectedMeeting}
              meetingStarted={attributes.current.data.meetingStarted}
              callerUser={attributes.current.data.callerUser}
              videoMuted={attributes.current.data.videoMuted}
              audioMuted={attributes.current.data.audioMuted}
              isHost={attributes.current.data.isHost}
              autoPermit={attributes.current.data.autoPermit}
              isDirectCall={attributes.current.data.isDirectCall}
              isRequestToJoin={attributes.current.data.isRequestToJoin}
              userToCall={attributes.current.data.userToCall}
            />
          </Window>
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
