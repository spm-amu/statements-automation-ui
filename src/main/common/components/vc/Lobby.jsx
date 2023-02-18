/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import LottieIcon from "../LottieIcon";
import LobbyWaitingList from "./LobbyWaitingList";
import Utils from '../../Utils';

const Lobby = (props) => {
  return (
      <>
        {
          props.userToCall ?
            <div
              className={'centered-flex-box'}
              style={{
                color: "white",
                width: "100%",
                minWidth: '320px',
                fontSize: '32px',
                overflow: 'hidden'
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
                width: '100%'
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
                  props.isHost || props.allUserParticipantsLeft ?
                    WAITING_FOR_OTHERS_TO_JOIN_MESSAGE
                    :
                    ATTENDEE_WAITING_FOR_PERMISION_MESSAGE
                }
              </div>
            </div>
        }
      </>
  );
};

export default Lobby;
