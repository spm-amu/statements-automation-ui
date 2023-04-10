import React, {useEffect, useRef, useState} from 'react';
import './MettingSettingsComponent.css';
import Button from '@material-ui/core/Button';
import {Switch} from '@material-ui/core';
import Icon from '../Icon';
import {useNavigate} from 'react-router-dom';
import Utils from '../../Utils';
import appManager from "../../../common/service/AppManager";
import {Stream} from "../../service/Stream";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {get, post} from '../../service/RestService';
import {Alert} from "@material-ui/lab";

const MeetingSettingsComponent = (props) => {
  const userVideo = useRef();
  const [stream, setStream] = useState();
  const [videoOptionDisabled, setVideoOptionDisabled] = useState(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true);
  const [autoPermit, setAutoPermit] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const {selectedMeeting} = props;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.close();
      }
    };
  }, []);

  useEffect(() => {
    if (stream) {
      stream.enableVideo(!videoMuted, null, null);
    }
  }, [videoMuted]);

  const setupStream = () => {
    let videoStream = new Stream();
    videoStream.init(true, false, (stream, shareStream) => {
      userVideo.current.srcObject = stream;
      setVideoOptionDisabled(false);
      //setVideoMuted(false);
    }, (e) => {
      console.log(e);
      setVideoOptionDisabled(true);
    });

    setStream(videoStream);
  };

  useEffect(() => {
    setupStream();
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

    selectedMeeting.attendees.forEach(att => {
      if (att.userId === userDetails.userId) {
        setIsHost(att.type === 'HOST');
      }
    });
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
    stream.close();
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
        isHost,
        autoPermit: autoPermit
      }
    })
  };

  return (
    <div className={'meeting-settings-container'}>
      <div className="toolbar row">
        <Button
          onClick={close}
          variant={'text'}
          size="large"
          style={{color: '#985F31', border: '1px solid #985F31'}}
        >
          CLOSE
        </Button>
      </div>
      <div className={'row centered-flex-box'}>
        <table>
          <tbody>
          <tr>
            <td className={'title'} colSpan={4}>
              {selectedMeeting.title}
            </td>
          </tr>
          <tr>
            <td style={{paddingBottom: '16px'}} colSpan={4}>
              Please select your audio and video settings
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              {
                videoOptionDisabled &&
                <Alert severity="warning">
                  We cannot initiate your video camera. Please check your video settings and try again. You may join the
                  meeting without video
                </Alert>
              }
            </td>
          </tr>
          <tr>
            <td className={'lobby-settings'} colSpan={4}>
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
                    width: '280px',
                    maxWidth: '280px',
                    height: '280px',
                    backgroundColor: '#000000',
                    borderRadius: '4px'
                  }}>
                    <div className={'avatar'} data-label={Utils.getInitials(loggedInUser)}/>
                  </div>
                }
                <div style={{maxWidth: '280px'}}>
                  <video
                    hidden={videoMuted}
                    muted playsInline autoPlay ref={userVideo}
                    style={{
                      maxHeight: '280px',
                      height: '280px',
                      width: 'unset',
                      maxWidth: '280px',
                      backgroundColor: '#000000',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style={{paddingTop: '8px', textAlign: 'right'}}>
              {videoMuted ? (
                <Icon id={'CAMERA_OFF'}/>
              ) : (
                <Icon id={'CAMERA'}/>
              )}
              <Switch
                onChange={(e, value) => {
                  muteVideo();
                }}
                disabled={videoOptionDisabled || videoOptionDisabled === null}
                value={videoMuted}
                checked={!videoMuted}
                color="primary"
              />
            </td>
            <td style={{paddingTop: '8px', textAlign: 'left'}}>
              {audioMuted ? (
                <Icon id={'MIC_OFF'}/>
              ) : (
                <Icon id={'MIC'}/>
              )}
              <Switch
                onChange={(e, value) => {
                  muteAudio();
                }}
                value={audioMuted}
                checked={!audioMuted}
                color="primary"
              />
            </td>
            {
              isHost &&
              <td style={{paddingTop: '8px', textAlign: 'left'}}>
                <FormGroup>
                  <FormControlLabel style={{paddingTop: '10px'}} control={
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

            <td style={{paddingTop: '8px', textAlign: 'right'}}>
              <Button
                variant={'contained'}
                disabled={videoOptionDisabled === null}
                size="large"
                color={'primary'}
                onClick={(e) => {
                  close();
                  navigateToMeetingRoom();
                }}
              >
                JOIN
              </Button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingSettingsComponent;
