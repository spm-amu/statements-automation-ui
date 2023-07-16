import React, {useEffect, useRef, useState} from 'react';
import './MettingSettings.css';
import Button from '@material-ui/core/Button';
import {Switch} from '@material-ui/core';
import Icon from '../Icon';
import {useNavigate} from 'react-router-dom';
import Utils from '../../Utils';
import appManager from "../../../common/service/AppManager";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {get} from '../../service/RestService';
import {Alert} from "@material-ui/lab";
import {VIDEO_CONSTRAINTS} from "./mediasoup/MeetingParticipant";

const MeetingSettings = (props) => {
  const userVideo = useRef();
  const [stream, setStream] = useState();
  const [videoOptionDisabled, setVideoOptionDisabled] = useState(false);
  const [audioOptionDisabled, setAudioOptionDisabled] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true);
  const [autoPermit, setAutoPermit] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const {selectedMeeting} = props;
  const navigate = useNavigate();

  useEffect(() => {
    let videoDisabled = true;
    let audioDisabled = true;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
          if ('videoinput' === device.kind) {
            videoDisabled = false;
          }
          if ('audioinput' === device.kind) {
            audioDisabled = false;
          }
        });

        setVideoOptionDisabled(videoDisabled);
        setAudioOptionDisabled(audioDisabled);
      }
    );

    return () => {
      closeStreams();
    };
  }, []);

  const startVideo = async () => {
    try {
      let videoStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      userVideo.current.srcObject = videoStream;
      setStream(videoStream);
    } catch (e) {
      setVideoMuted(true);
      setVideoOptionDisabled(true);
    }
  };

  useEffect(() => {
    if (!videoMuted) {
      startVideo();
    } else if (userVideo.current && userVideo.current.srcObject) {
      userVideo.current.srcObject.getVideoTracks()[0].stop();
    }
  }, [videoMuted]);

  useEffect(() => {
    let userDetails = appManager.getUserDetails();
    setLoggedInUser(userDetails.name);

    get(`${appManager.getAPIHost()}/api/v1/meeting/settings/${selectedMeeting.id}`,
      (response) => {
        if (Utils.isNull(response.askToJoin)) {
          setAutoPermit(false);
        } else {
          setAutoPermit(response.askToJoin);
        }
      }, (e) => {
      });

    if (selectedMeeting && selectedMeeting.attendees) {
      selectedMeeting.attendees.forEach(att => {
        if (att.userId === userDetails.userId) {
          setIsHost(att.type === 'HOST');
        }
      });
    }
  }, []);

  const muteVideo = () => {
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const muteAudio = () => {
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const toggleAskToJoin = () => {
    setAutoPermit((prevStatus) => !prevStatus);
  };

  const closeStreams = () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
  };

  const close = () => {
    closeStreams();
    navigate("/view/calendar");
  };

  const navigateToMeetingRoom = () => {
    navigate("/view/meetingRoom", {
      state: {
        displayMode: 'window',
        selectedMeeting: selectedMeeting,
        videoMuted: videoMuted,
        audioMuted: audioMuted,
        videoDisabled: videoOptionDisabled,
        audioDisabled: audioOptionDisabled,
        isHost,
        autoPermit: autoPermit
      }
    })
  };

  return (
    <div className={'meeting-settings-container centered-flex-box'}>
      <div className={'meeting-settings-content'}>
        <div className={'meeting-settings-header'}>
          <table style={{width: '100%'}}>
            <tbody>
            <tr>
              <td className={'title'} colSpan={4}>
                {selectedMeeting.title}
              </td>
            </tr>
            <tr>
              <td style={{paddingBottom: '16px', color: 'white'}} colSpan={4}>
                Please select your audio and video settings
              </td>
            </tr>
            <tr>
              <td>
                {
                  (videoOptionDisabled || audioOptionDisabled) &&
                  <Alert severity="warning" style={
                    {
                      color: 'rgb(235, 63, 33)',
                      maxHeight: '32px',
                      padding: '0 8px',
                      margin: '0 -16px 0 16px',
                      width: 'calc(100% - 32px)'
                    }
                  }>
                    {
                      videoOptionDisabled &&
                      <span>No video camera available </span>
                    }
                    {
                      audioOptionDisabled &&
                      <span>No audio device available</span>
                    }
                  </Alert>
                }
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div className={'meeting-settings-video'}>
          <div
            className={'centered-flex-box'}
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            {
              videoMuted &&
              <div className={'centered-flex-box'} style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                borderRadius: '4px'
              }}>
                <div className={'avatar'} data-label={Utils.getInitials(loggedInUser)}/>
              </div>
            }
            <div>
              <video
                hidden={videoMuted}
                muted playsinline autoPlay ref={userVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>
        <div className={'meeting-settings-toolbar centered-flex-box'}>
          <table>
            <tr>
              <td style={{textAlign: 'right'}}>
                {videoMuted ? (
                  <Icon id={'CAMERA_OFF'} color={'white'}/>
                ) : (
                  <Icon id={'CAMERA'} color={'white'}/>
                )}
                <Switch
                  onChange={(e, value) => {
                    muteVideo();
                  }}
                  disabled={videoOptionDisabled}
                  value={videoMuted}
                  checked={!videoMuted}
                  color="primary"
                />
              </td>
              <td style={{textAlign: 'left'}}>
                {audioMuted ? (
                  <Icon id={'MIC_OFF'} color={'white'}/>
                ) : (
                  <Icon id={'MIC'} color={'white'}/>
                )}
                <Switch
                  onChange={(e, value) => {
                    muteAudio();
                  }}
                  disabled={audioOptionDisabled}
                  value={audioMuted}
                  checked={!audioMuted}
                  color="primary"
                />
              </td>
              {
                isHost &&
                <td style={{textAlign: 'left'}}>
                  <FormGroup>
                    <FormControlLabel style={{paddingTop: '10px', color: 'white'}} control={
                      <Switch
                        checked={autoPermit}
                        value={autoPermit}
                        color="primary"
                        onChange={(e, value) => {
                          toggleAskToJoin();
                        }}
                      />
                    } label="Auto permit"/>
                  </FormGroup>
                </td>
              }
              <td style={{textAlign: 'right'}}>
                <Button
                  variant={'contained'}
                  size="large"
                  style={{color: '#FFFFFF', backgroundColor: '#198754', borderRadius: '4px', marginRight: '2px'}}
                  onClick={(e) => {
                    close();
                    navigateToMeetingRoom();
                  }}
                >
                  JOIN
                </Button>
              </td>
              <td style={{textAlign: 'right'}}>
                <Button
                  variant={'contained'}
                  onClick={close}
                  size="large"
                  style={{color: '#FFFFFF', backgroundColor: 'rgb(235, 63, 33)', borderRadius: '4px'}}
                >
                  CLOSE
                </Button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeetingSettings;
