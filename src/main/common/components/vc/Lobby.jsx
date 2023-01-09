/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import LottieIcon from "../LottieIcon";
import LobbyWaitingList from "./LobbyWaitingList";
import Utils from '../../Utils';

const WAITING_FOR_OTHERS_TO_JOIN_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_FOR_PERMISION_MESSAGE = 'Waiting for the meeting host to let you in';

const Lobby = (props) => {
  const {
    meetingTitle,
    waitingList
  } = props;

  return (
      <div
        className={'centered-flex-box'}
        style={{
          height: 'calc(100% - 32px)',
          width: '100%',
          minWidth: '320px',
          fontSize: '32px',
          overflow: 'hidden'
        }}
      >
        {!Utils.isNull(props.userToCall) ?
          <div>
            <div className={'centered-flex-box'}>
              <LottieIcon id={'calling'}/>
            </div>
            <div>
              {'Calling ' + props.userToCall.name}
            </div>
          </div>
          :
          <>
            <div
              style={{
                display: 'inline-block',
                textAlign: 'center',
                margin: 'auto',
                overflow: 'hidden'
              }}
            >
              <div style={props.displayState === 'MINIMIZED' ? {margin: '0 8px', fontSize: '20px'} : null}>
                {meetingTitle}
              </div>
              <div className={'centered-flex-box'}>
                <LottieIcon id={props.displayState === 'MINIMIZED' ? 'waiting-sm' : 'waiting'}/>
              </div>
              <div style={props.displayState === 'MINIMIZED' ? {margin: '0 8px', fontSize: '20px'} : null}>
                {
                  props.isHost || props.allUserParticipantsLeft || props.askToJoin === false ?
                    WAITING_FOR_OTHERS_TO_JOIN_MESSAGE
                    :
                    ATTENDEE_WAITING_FOR_PERMISION_MESSAGE
                }
              </div>
            </div>
            <LobbyWaitingList waitingList={waitingList}
                              rejectUserHandler={props.rejectUserHandler}
                              acceptUserHandler={props.acceptUserHandler}/>
          </>
        }
      </div>
  );
};

export default Lobby;
