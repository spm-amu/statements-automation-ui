/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import LottieIcon from "../LottieIcon";
import './MeetingSession.css'
import LobbyWaitingList from "./LobbyWaitingList";

const HOST_WAITING_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_MESSAGE = 'Waiting for the meeting host to let you in';


const Lobby = (props) => {
  const {
    waitingList
  } = props;

  return (
    <div
      className={'centered-flex-box'}
      style={{
        height: 'calc(100% - 180px)',
        width: '100%',
        fontSize: '32px'
      }}
    >
      <div
        style={{
          display: 'inline-block',
          textAlign: 'center',
          margin: 'auto',
        }}
      >
        <div className={'centered-flex-box'}>
          <LottieIcon id={'waiting'}/>
        </div>
        <div>
          {
            props.isHost ?
              HOST_WAITING_MESSAGE
              :
              ATTENDEE_WAITING_MESSAGE
          }
        </div>
      </div>
      <LobbyWaitingList waitingList={waitingList}
                        rejectUserHandler={props.rejectUserHandler}
                        acceptUserHandler={props.acceptUserHandler}/>
    </div>
  );
};

export default Lobby;
