/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
const { electron } = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

const DialingPreview = (props) => {
  const [caller, setCaller] = useState(null);
  const [initials, setInitials] = useState('');

  useEffect(() => {
    electron.ipcRenderer.on('dialingViewContent', args => {
      waitingAudio.play();
      setCaller(args.payload);
    });
  }, []);

  useEffect(() => {
    if (caller) {
      setInitials(Utils.getInitials(caller.callerUser.name));
    }
  }, [caller]);

  const onAnswerCall = () => {
    waitingAudio.pause();

    electron.ipcRenderer.sendMessage('answerCall', {
      payload: caller
    });
  }

  const onDeclineCall = () => {
    waitingAudio.pause();

    electron.ipcRenderer.sendMessage('declineCall', {
      payload: {
        callerId: caller.callerUser.socketId
      }
    });
  }

	return (
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div className={'centered-flex-box'} style={{width: '90%', height: '70%'}}>
        <div className={'avatar'} data-label={initials} />
      </div>
      <div className={'dialing-preview-footer'}>
        <div className={'row'}>
          <div className={'footer-toolbar'}>
            <div className={'row centered-flex-box'}>
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
        </div>
      </div>
    </div>
  );
};

export default DialingPreview;
