import React, {useEffect, useRef, useState} from "react";
import "./Footer.css"
import Toolbar from './Toolbar'
import MeetingParticipant from "./MeetingParticipant";
import appManager from "../../../common/service/AppManager";

const Footer = (props) => {
  const [screenShared, setScreenShared] = useState(false);

  const {
    participants,
    hasUnreadChats,
    hasUnseenWhiteboardEvent,
    displayState,
    videoMuted,
    audioMuted,
    userStream,
    userVideo,
    handRaised,
    whiteBoardShown,
    step,
    isHost,
    autoPermit,
    participantsRaisedHands,
    someoneSharing,
    meetingTitle
  } = props;

  useEffect(() => {
    setScreenShared(props.screenShared);
  }, [props.screenShared]);

  return (
    <div className={'vc-footer'}
    >
      <div className={'row'}>
        {
          displayState === 'MAXIMIZED' &&
          <div  className={'time'}>
            <h3
              style={{
                position: 'absolute',
                fontSize: 'auto',
                marginBottom: '0'
              }}
            >
              {new Date().toLocaleString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
              })}
            </h3>
          </div>
        }
        <div className={'col toolbar-container'}>
          <Toolbar eventHandler={props.toolbarEventHandler}
                   hasUnreadChats={hasUnreadChats}
                   hasUnseenWhiteboardEvent={hasUnseenWhiteboardEvent}
                   participants={participants}
                   participantsRaisedHands={participantsRaisedHands}
                   handRaised={handRaised}
                   whiteBoardShown={whiteBoardShown}
                   userVideo={userVideo}
                   userStream={userStream}
                   videoMuted={videoMuted}
                   audioMuted={audioMuted}
                   displayState={displayState}
                   step={step}
                   isHost={isHost}
                   autoPermit={autoPermit}
                   someoneSharing={someoneSharing}
                   screenShared={screenShared}
          />
        </div>
        {
          displayState === 'MAXIMIZED' &&
          <div className={'time'}>
            <h3
              style={{
                position: 'absolute',
                fontSize: 'auto',
                marginBottom: '0'
              }}
            >
              {meetingTitle}
            </h3>
          </div>
        }
        {
          /*<div className={'col video'} style={displayState === 'MAXIMIZED' ? null : {display: 'none'}}>
            <div
              style={{display: 'flex', justifyContent: 'flex-end'}}
            >
              <section className="call-overlay-footer-yourself">
                <MeetingParticipant
                  data={{
                    peer: null,
                    name: appManager.getUserDetails().name,
                    avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
                  }}
                  videoMuted={videoMuted}
                  audioMuted={audioMuted}
                  screenShared={screenShared}
                  displayName={false}
                  ref={userVideo}
                  padding={'0'}
                />
              </section>
            </div>
          </div>*/
        }
      </div>
    </div>
  );
};

export default Footer;
