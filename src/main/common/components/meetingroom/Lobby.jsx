/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from "react";
import LottieIcon from "../LottieIcon";
import Utils from '../../Utils';
import appManager from "../../../common/service/AppManager";
import {VIDEO_CONSTRAINTS} from "./mediasoup/MeetingParticipant";
import LobbyWaitingList from "./LobbyWaitingList";

const WAITING_FOR_OTHERS_TO_JOIN_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_FOR_PERMISION_MESSAGE = 'Waiting for the meeting host to let you in';

const Lobby = (props) => {

  const videoRef = useRef();
  const streamRef = useRef();
  const {waitingList} = props;

  function stopVideoTracks() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }

      streamRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      stopVideoTracks();
    }
  }, []);

  useEffect(() => {
    if(props.videoMuted) {
      stopVideoTracks();
    } else {
      navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS).then((stream) => {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      });
    }
  }, [props.videoMuted]);

  return (
    <div style={{
      height: '100%',
      width: '100%'
    }}>
      <div style={{
        height: 'calc(100% - 200px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {
          props.userToCall ?
            <div
              className={'centered-flex-box'}
              style={{
                color: "white",
                width: "320px",
                minWidth: '320px',
                fontSize: '32px',
                overflow: 'hidden',
                backgroundColor: 'rgb(40, 40, 43)'
              }}
            >
              {!Utils.isNull(props.userToCall) &&
              <div>
                <div className={'centered-flex-box'}>
                  <LottieIcon id={'calling'}/>
                </div>
                <div>
                  {'Calling ' + props.userToCall.name}
                </div>
              </div>
              }
            </div>
            :
            <div
              style={{
                display: 'inline-block',
                textAlign: 'center',
                margin: 'auto',
                overflow: 'hidden',
                fontSize: '20px',
                color: '#F1F1F1',
                width: '320px',
                padding: '32px',
                backgroundColor: 'rgb(40, 40, 43)'
              }}
              className={'row no-padding no-margin centered-flex-box'}
            >
              <div style={props.displayState === 'MINIMIZED' ? {margin: '0 8px', fontSize: '20px'} : null}>
                {props.meetingTitle}
              </div>
              <div className={'centered-flex-box'}>
                {/*<LottieIcon id={props.displayState === 'MINIMIZED' ? 'waiting-sm' : 'waiting'}/>*/}
              </div>
              <div style={props.displayState === 'MINIMIZED' ? {margin: '0 8px', fontSize: '20px'} : null}>
                {
                  props.isHost || props.autoPermit || props.allUserParticipantsLeft ?
                    WAITING_FOR_OTHERS_TO_JOIN_MESSAGE
                    :
                    ATTENDEE_WAITING_FOR_PERMISION_MESSAGE
                }
              </div>
              {
                ((waitingList && waitingList.length > 0)) &&
                <div className={'no-side-margin no-side-padding grid-side-bar'} style={
                  {
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    top: '0',
                    right: '16px'
                  }
                }>
                  {
                    waitingList && waitingList.length > 0 &&
                    <LobbyWaitingList waitingList={waitingList}
                                      autoHeight={true}
                                      rejectUserHandler={props.rejectUserHandler}
                                      acceptUserHandler={props.acceptUserHandler}/>
                  }
                </div>
              }
            </div>
        }
      </div>
      <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
        <div style={{width: '200px', height: '148px', backgroundColor: 'rgb(40, 40, 43)'}} className={'centered-flex-box'}>
          {
            props.videoMuted &&
            <div
              className={props.sizing === 'md' ? 'avatar avatar-md' : props.sizing === 'sm' ? 'avatar avatar-sm' : 'avatar'}
              data-label={Utils.getInitials(appManager.getUserDetails().name)}
              style={
                {
                  fontSize: props.sizing === 'sm' ? '20px' : null
                }
              }/>
          }
          {
            !props.videoMuted &&
            <video
              id={'lobby-video'}
              width={640}
              height={320}
              autoPlay ref={videoRef} muted
              style={{
                width: '100%',
                height: '100%',
                zIndex: '0'
              }}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default Lobby;
