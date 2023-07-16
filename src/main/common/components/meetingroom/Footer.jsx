import React, {useEffect, useState} from "react";
import "./Footer.css"
import Toolbar from './Toolbar'

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
    someoneSharing,
    videoDisabled,
    audioDisabled,
    isRecording
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
          <div  className={'time footer-white-content'}>
            <h3
              style={{
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
                   handRaised={handRaised}
                   whiteBoardShown={whiteBoardShown}
                   userVideo={userVideo}
                   userStream={userStream}
                   videoDisabled={videoDisabled}
                   audioDisabled={audioDisabled}
                   videoMuted={videoMuted}
                   audioMuted={audioMuted}
                   displayState={displayState}
                   step={step}
                   isHost={isHost}
                   autoPermit={autoPermit}
                   someoneSharing={someoneSharing}
                   screenShared={screenShared}
                   isRecording={isRecording}
          />
        </div>
        {
          displayState === 'MAXIMIZED' &&
          <div className={'time'}>
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
