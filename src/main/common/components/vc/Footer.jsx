import React, {useRef, useState} from "react";
import "./Footer.css"
import Toolbar from './Toolbar'
import MeetingParticipant from "./MeetingParticipant";

const Footer = (props) => {
  const {
    videoMuted,
    audioMuted,
    screenShared,
    userStream,
    userVideo,
    handRaised
  } = props;

  return (
    <div className={'vc-footer'}
    >
      <div className={'row'}>
        <div className={'col'}>
          <h3
            style={{
              position: 'absolute',
              fontSize: 'auto',
            }}
          >
            {new Date().toLocaleString('en-US', {
              hour12: true,
              hour: 'numeric',
              minute: 'numeric',
            })}
          </h3>
        </div>
        <div className={'col'}>
          <Toolbar eventHandler={props.toolbarEventHandler}
                   handRaised={handRaised}
                   userVideo={userVideo}
                   userStream={userStream}
                   videoMuted={videoMuted}
                   audioMuted={audioMuted}
          />
        </div>
        <div className={'col'}>
          <div
            style={{display: 'flex', justifyContent: 'flex-end'}}
          >
            <section className="call-overlay-footer-yourself">
              <MeetingParticipant
                data={{
                  peer: null,
                  name: JSON.parse(sessionStorage.getItem('userDetails')).name,
                  avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
                }}
                videoMuted={videoMuted}
                audioMuted={audioMuted}
                displayName={false}
                ref={userVideo}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
