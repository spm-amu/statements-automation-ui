/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './InComingCallWindow.css';
import Icon from "../Icon";
import Button from '../RegularButton';

const {electron} = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');
const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');

const SystemAlertWindow = (props) => {
  const [initials, setInitials] = useState('');
  const soundInterval = useRef();
  const [systemAlert, setSystemAlert] = useState(null);

  useEffect(() => {
    electron.ipcRenderer.on('systemAlertWindowContent', args => {
      console.log("\n\n\n\nPAYLOAD : ", args.payload);
      setSystemAlert(args.payload);
      soundInterval.current = null;
      permitAudio.play();
    });
  }, []);

  const joinMeeting = () => {
    electron.ipcRenderer.sendMessage('joinMeetingEvent', {
      payload: systemAlert
    });
  };

  const closeWindow = () => {
    electron.ipcRenderer.sendMessage('closeWindowEvent');
  };

  return (
    (systemAlert) &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
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
              <div className={'centered-flex-box w-100'}
                   style={{marginTop: '8px', fontSize: '16px', fontWeight: '500', color: '#FFFFFF'}}>
                {systemAlert.params.meetingTitle}
              </div>
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
