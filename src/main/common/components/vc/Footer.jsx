import React, {useRef, useState} from "react";
import "./Footer.css"
import Toolbar from './Toolbar'
import MeetingParticipant from "./MeetingParticipant";
import appManager from "../../../common/service/AppManager";

const Footer = (props) => {
  const {
    displayState,
    videoMuted,
    audioMuted,
    screenShared,
    userStream,
    userVideo,
    handRaised,
    step,
    isHost,
    autoPermit
  } = props;

  return (
    <div className={'vc-footer'}
    >
      <div className={'row'}>
        {
          displayState === 'MAXIMIZED' &&
          <div  className={'col time'}>
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
                   handRaised={handRaised}
                   userVideo={userVideo}
                   userStream={userStream}
                   videoMuted={videoMuted}
                   audioMuted={audioMuted}
                   displayState={displayState}
                   step={step}
                   isHost={isHost}
                   autoPermit={autoPermit}
          />
        </div>
        {
          <div className={'col video'} style={displayState === 'MAXIMIZED' ? null : {display: 'none'}}>
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
          </div>
        }
      </div>
    </div>
  );
};

export default Footer;
