/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import LottieIcon from "../LottieIcon";
import LobbyWaitingList from "./LobbyWaitingList";
import Utils from '../../Utils';

const Lobby = (props) => {
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
  );
};

export default Lobby;
