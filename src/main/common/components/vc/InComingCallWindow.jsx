/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './InComingCallWindow.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
import Button from '../RegularButton';
import {Form} from "reactstrap";
import TextField from "../customInput/TextField";

const {electron} = window;

const waitingAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/waiting.mp3');
const permitAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/permission.mp3');

const InComingCallWindow = (props) => {
  const [callPayload, setCallPayload] = useState(null);
  const [meetingRequest, setMeetingRequest] = useState(null);
  const [initials, setInitials] = useState('');
  const soundInterval = useRef();
  const [refresher, setRefresher] = useState(false);
  const [state] = useState({
    mode: 'DEFAULT',
    rejectionReason: ''
  });

  useEffect(() => {
    electron.ipcRenderer.on('incomingCallWindowContent', args => {
      resetValues();
      soundInterval.current = setInterval(() => {
        waitingAudio.play();
      }, 100);

      if (args.payload.meetingJoinRequest) {
        setMeetingRequest(args.payload);
      } else {
        setCallPayload(args.payload);
      }

      setRefresher(!refresher);
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

    resetValues();
  };

  const declineCall = () => {
    waitingAudio.pause();
    clearInterval(soundInterval.current);
    electron.ipcRenderer.sendMessage('declineCall', {
      payload: {
        callerId: callPayload ? callPayload.callerUser.socketId : null,
        callPayload: meetingRequest ? meetingRequest : callPayload,
        reason: state.rejectionReason
      }
    });

    resetValues();
  };

  const resetValues = () => {
    state.mode = 'DEFAULT';
    state.rejectionReason = '';
  };

  return (
    <>
      {
        state.mode === 'DEFAULT' ?
          <>
            {
              (callPayload || meetingRequest || state.systemAlert) &&
              <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
                <div className={'centered-flex-box w-100'}
                     style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
                  {
                    state.systemAlert ? state.systemAlert.message :
                      callPayload ? `${callPayload.callerUser.name} is trying to call you` : `${meetingRequest.callerName} wants you to join meeting`
                  }
                </div>
                <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
                  {
                    state.systemAlert ?
                      <div>
                        <div className={'avatar'} data-label={initials}>
                          <Icon id={'CALENDAR'} style={{color: '#FFFFFF'}} fontSize={'large'}/>
                        </div>
                        <div className={'centered-flex-box w-100'}
                             style={{marginTop: '8px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
                          {state.systemAlert.params.meetingTitle}
                        </div>
                      </div>
                      :
                      <div className={'avatar'} data-label={initials}/>
                  }
                </div>
                <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
                  {
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
                        onClick={() => {
                          state.mode = 'CAPTURE_REJECT_REASON';
                          setRefresher(!refresher);
                        }}
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
                <div style={{marginTop: '8px'}}>
                  <TextField
                    label="Title"
                    id="title"
                    value={state.rejectionReason}
                    valueChangeHandler={(e) => {
                      state.rejectionReason = e.target.value;
                      setRefresher(!refresher);
                    }}
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
              <div style={{marginRight: '4px'}}>
                <Button
                  onClick={(e) => {
                    state.mode = 'DEFAULT';
                    setRefresher(!refresher);
                  }}
                  variant={'contained'}
                  size="large"
                  color={'primary'}
                >
                  BACK
                </Button>
              </div>
              <div style={{marginRight: '4px'}}>
                <IconButton
                  onClick={() => declineCall()}
                  disabled={!state.rejectionReason || state.rejectionReason.length === 0}
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

export default InComingCallWindow;
