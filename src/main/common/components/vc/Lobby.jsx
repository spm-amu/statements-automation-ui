/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import LottieIcon from "../LottieIcon";
import Utils from '../../Utils';

const WAITING_FOR_OTHERS_TO_JOIN_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_FOR_PERMISION_MESSAGE = 'Waiting for the meeting host to let you in';

const Lobby = (props) => {
  return (
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
              <LottieIcon id={props.displayState === 'MINIMIZED' ? 'waiting-sm' : 'waiting'}/>
            </div>
            <div style={props.displayState === 'MINIMIZED' ? {margin: '0 8px', fontSize: '20px'} : null}>
              {
                props.isHost || props.autoPermit || props.allUserParticipantsLeft ?
                  WAITING_FOR_OTHERS_TO_JOIN_MESSAGE
                  :
                  ATTENDEE_WAITING_FOR_PERMISION_MESSAGE
              }
            </div>
          </div>
      }
    </div>
  );
};

export default Lobby;
