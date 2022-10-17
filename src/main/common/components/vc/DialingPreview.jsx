/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';

const {electron} = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

const DialingPreview = (props) => {
  const [caller, setCaller] = useState(null);
  const [initials, setInitials] = useState('');
  const soundInterval = useRef();

  useEffect(() => {
    electron.ipcRenderer.on('dialingViewContent', args => {
      soundInterval.current = setInterval(() => {
        waitingAudio.play();
      }, 100);
      setCaller(args.payload);
    });

    electron.ipcRenderer.on('cancelCall', args => {
      waitingAudio.pause();
      clearInterval(soundInterval.current);
    });
  }, []);

  useEffect(() => {
    if (caller) {
      setInitials(Utils.getInitials(caller.callerUser.name));
    }
  }, [caller]);

  const onAnswerCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);

    electron.ipcRenderer.sendMessage('answerCall', {
      payload: caller
    });
  };

  const onDeclineCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);

    electron.ipcRenderer.sendMessage('declineCall', {
      payload: {
        callerId: caller.callerUser.socketId
      }
    });
  };

  return (
    caller &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div className={'centered-flex-box w-100'} style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
        {caller.callerUser.name} is trying to call you
      </div>
      <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
        <div className={'avatar'} data-label={initials}/>
      </div>
      <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
        <IconButton
          onClick={onAnswerCall}
          style={{
            backgroundColor: 'green',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'CALL'}/>
        </IconButton>

        <IconButton
          onClick={onDeclineCall}
          style={{
            backgroundColor: '#eb3f21',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'CALL_END'}/>
        </IconButton>
      </div>
    </div>
  );
};

export default DialingPreview;
