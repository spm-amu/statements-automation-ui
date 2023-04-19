/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './InComingCallWindow.css';
import Icon from "../Icon";
import Button from '../RegularButton';
import appManager from "../../service/AppManager";

const {electron} = window;

const waitingAudio = new Audio(appManager.getSoundFileHost() + '/waiting.mp3');
const permitAudio = new Audio(appManager.getSoundFileHost() + '/permission.mp3');

const SystemAlertWindow = (props) => {
  const [initials, setInitials] = useState('');
  const soundInterval = useRef();
  const [systemAlert, setSystemAlert] = useState(null);

  function stopRingingSound() {
    waitingAudio.pause();
    clearInterval(soundInterval.current);
    soundInterval.current = null;
  }

  useEffect(() => {
    electron.ipcRenderer.on('systemAlertWindowContent', args => {
      console.log("\n\n\n\nSYSTEM ALERT PAYLOAD : ", args.payload);
      setSystemAlert(args.payload);
      soundInterval.current = null;
      if(args.payload && args.payload.params && args.payload.params.soundType === 'RING') {
        soundInterval.current = setInterval(() => {
          if(soundInterval.current) {
            waitingAudio.play();
          }
        }, 100);
      } else {
        permitAudio.play();
      }
    });

    return () => {
      stopRingingSound();
    }
  }, []);

  const joinMeeting = () => {
    electron.ipcRenderer.sendMessage('joinMeetingEvent', {
      payload: systemAlert
    });

    stopRingingSound();
  };

  const closeWindow = () => {
    electron.ipcRenderer.sendMessage('closeWindowEvent');
    stopRingingSound();
  };

  return (
    (systemAlert) &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)', padding: '16px'}}>
      <div className={'centered-flex-box w-100'}
           style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
        {
          systemAlert.message
        }
      </div>
      <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
        {
          systemAlert ?
            <div>
              <div className={'centered-flex-box w-100'}>
                <div className={'avatar'} data-label={initials} style={{width: '54px', height: '54px', fontSize: '16px'}}>
                  <Icon id={'CALENDAR'} style={{color: '#FFFFFF'}} fontSize={'large'}/>
                </div>
              </div>
              {/*<div className={'centered-flex-box w-100'}
                   style={{marginTop: '8px', fontSize: '16px', fontWeight: '500', color: '#FFFFFF'}}>
                {systemAlert.params.meetingTitle}
              </div>*/}
            </div>
            :
            <div className={'avatar'} data-label={initials} style={{width: '54px', height: '54px', fontSize: '16px'}}/>
        }
      </div>
      <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
        {
          systemAlert &&
          <div style={{padding: '8px'}} className={'row no-margin w-100'}>
            <div className={'col no-margin'} style={{paddingRight: '8px'}}>
              <Button
                onClick={() => joinMeeting()}
                variant="contained"
                color="success"
                fullWidth={true}
              >
                <span>JOIN</span>
              </Button>
            </div>
            <div style={{paddingLeft: '0'}} className={'col no-margin'}>
              <Button
                onClick={() => closeWindow()}
                variant="contained"
                color="danger"
                fullWidth={true}
              >
                <span>CLOSE</span>
              </Button>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default SystemAlertWindow;
