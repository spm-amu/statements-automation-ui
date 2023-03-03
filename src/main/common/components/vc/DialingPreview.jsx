/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
import Button from '../RegularButton';
import {Form} from "reactstrap";
import TextField from "../customInput/TextField";
import AutoComplete from "../customInput/AutoComplete";
import appManager from "../../service/AppManager";

const {electron} = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');
const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');

const DialingPreview = (props) => {
  const [callPayload, setCallPayload] = useState(null);
  const [meetingRequest, setMeetingRequest] = useState(null);
  const [initials, setInitials] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [systemAlert, setSystemAlert] = useState(null);
  const soundInterval = useRef();
  const [mode, setMode] = useState('DEFAULT');

  useEffect(() => {
    electron.ipcRenderer.on('dialingViewContent', args => {
      if (args.payload.type) {
        setSystemAlert(args.payload);
        soundInterval.current = null;
        permitAudio.play();
      } else {
        setMode('DEFAULT');
        setRejectionReason('');

        soundInterval.current = setInterval(() => {
          waitingAudio.play();
        }, 100);

        if (args.payload.meetingJoinRequest) {
          setMeetingRequest(args.payload);
        } else {
          setCallPayload(args.payload);
        }
      }
    });

    electron.ipcRenderer.on('cancelCall', args => {
      waitingAudio.pause();
      clearInterval(soundInterval.current);
    });
  }, []);

  useEffect(() => {
    if (callPayload) {
      setInitials(Utils.getInitials(callPayload.callerUser.name));
    }
  }, [callPayload]);

  useEffect(() => {
    if (meetingRequest) {
      setInitials(Utils.getInitials(meetingRequest.callerName));
    }
  }, [meetingRequest]);

  const answerCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);

    electron.ipcRenderer.sendMessage('answerCall', {
      payload: callPayload ? callPayload : meetingRequest
    });
  };

  const declineCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);
    electron.ipcRenderer.sendMessage('declineCall', {
      payload: {
        callerId: callPayload ? callPayload.callerUser.socketId : null,
        callPayload: meetingRequest ? meetingRequest : callPayload,
        reason: rejectionReason
      }
    });
  };

  const joinMeeting = () => {
    electron.ipcRenderer.sendMessage('joinMeetingEvent', {
      payload: systemAlert
    });
  };

  const closeWindow = () => {
    electron.ipcRenderer.sendMessage('closeWindowEvent');
  };

  return (
    <>
      {
        mode === 'DEFAULT' ?
          <>
            {
              (callPayload || meetingRequest || systemAlert) &&
              <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
                <div className={'centered-flex-box w-100'}
                     style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
                  {
                    systemAlert ? systemAlert.message :
                      callPayload ? `${callPayload.callerUser.name} is trying to call you` : `${meetingRequest.callerName} wants you to join meeting`
                  }
                </div>
                <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
                  {
                    systemAlert ?
                      <div>
                        <div className={'avatar'} data-label={initials}>
                          <Icon id={'CALENDAR'} style={{color: '#FFFFFF'}} fontSize={'large'}/>
                        </div>
                        <div className={'centered-flex-box w-100'}
                             style={{marginTop: '8px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
                          {systemAlert.params.meetingTitle}
                        </div>
                      </div>
                      :
                      <div className={'avatar'} data-label={initials}/>
                  }
                </div>
                <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
                  {
                    systemAlert ?
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
                      :
                      <>
                        <IconButton
                          onClick={answerCall}
                          style={{
                            backgroundColor: 'green',
                            color: 'white',
                            marginRight: '4px'
                          }}
                        >
                          <Icon id={'CALL'}/>
                        </IconButton>
                        <IconButton
                          onClick={() => setMode('CAPTURE_REJECT_REASON')}
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
            }
            </>
          :
          <div
            className={'reject-reason-form'}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              padding: '32px',
              backgroundColor: '#FFFFFF',
              marginTop: '2px',
            }}
          >
            <h5 className={"title"}>
              Rejection reason
            </h5>
            <Form>
              <div>
                <div style={{ marginTop: '8px' }}>
                  <TextField
                    label="Title"
                    id="title"
                    value={rejectionReason}
                    valueChangeHandler={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            </Form>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'left',
                margin: '16px 0',
              }}
            >
              <div style={{ marginRight: '4px' }}>
                <Button
                  onClick={(e) => setMode('DEFAULT')}
                  variant={'contained'}
                  size="large"
                  color={'primary'}
                >
                  BACK
                </Button>
              </div>
              <div style={{ marginRight: '4px' }}>
                <IconButton
                  onClick={() => declineCall()}
                  disabled={!rejectionReason || rejectionReason.length === 0}
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
      }
    </>
  );
};

export default DialingPreview;
