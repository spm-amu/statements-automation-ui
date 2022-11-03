/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
import styles from '../view/security/LoginStyle';
import Button from '../RegularButton';

const {electron} = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');

const DialingPreview = (props) => {
  const [caller, setCaller] = useState(null);
  const [meetingRequest, setMeetingRequest] = useState(null);
  const [initials, setInitials] = useState('');
  const [systemAlert, setSystemAlert] = useState(null);
  const soundInterval = useRef();

  useEffect(() => {
    electron.ipcRenderer.on('dialingViewContent', args => {
      soundInterval.current = setInterval(() => {
        waitingAudio.play();
      }, 100);

      if (args.payload.type) {
        setSystemAlert(args.payload);
      } else {
        if (args.payload.meetingJoinRequest) {
          setMeetingRequest(args.payload);
        } else {
          setCaller(args.payload);
        }
      }
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

  useEffect(() => {
    if (meetingRequest) {
      setInitials(Utils.getInitials(meetingRequest.callerName));
    }
  }, [meetingRequest]);

  const onAnswerCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);

    electron.ipcRenderer.sendMessage('answerCall', {
      payload: caller ? caller : meetingRequest
    });
  };

  const onDeclineCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);

    electron.ipcRenderer.sendMessage('declineCall', {
      payload: {
        callerId: caller ? caller.callerUser.socketId : null
      }
    });
  };

  const joinMeeting = () => {
    electron.ipcRenderer.sendMessage('joinMeetingEvent', {
      payload: systemAlert
    });
  };

  const editMeeting = () => {
    electron.ipcRenderer.sendMessage('editMeetingEvent', {
      payload: systemAlert
    });
  };

  return (
    (caller || meetingRequest || systemAlert) &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div className={'centered-flex-box w-100'} style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
        {
          systemAlert ? systemAlert.message :
            caller ? `${caller.callerUser.name} is trying to call you` : `${ meetingRequest.callerName } wants you to join meeting`
        }
      </div>
      <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
        <div className={'avatar'} data-label={initials}/>
      </div>
      <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
        {
          systemAlert ?
            <>
              <Button
                onClick={() => joinMeeting()}
                variant="contained"
                color="primary"
                fullWidth={true}
                style={styles.loginBtn}
              >
                <span>JOIN</span>
              </Button>

              <Button
                onClick={() => editMeeting()}
                variant="contained"
                color="primary"
                fullWidth={true}
                style={styles.loginBtn}
              >
                <span>EDIT</span>
              </Button>
            </> :
            <>
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
            </>
        }
      </div>
    </div>
  );
};

export default DialingPreview;
