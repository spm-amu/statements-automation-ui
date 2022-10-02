/* eslint-disable react-hooks/exhaustive-deps */
import React, { } from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import LottieIcon from './LottieIcon';

const Lobby = (props) => {
	return (
    <div
      className={'centered-flex-box'}
      style={{
        height: 'calc(100% - 180px)',
        width: '100%',
        fontSize: '32px',
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
          <LottieIcon id={'waiting'} />
        </div>
        <div>{ props.message }</div>
      </div>
    </div>
  );
};

export default Lobby;
