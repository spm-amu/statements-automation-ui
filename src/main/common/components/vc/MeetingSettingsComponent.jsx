import React, {useEffect, useRef, useState} from 'react';
import './MettingSettingsComponent.css';
import Button from '@material-ui/core/Button';
import {Switch} from '@material-ui/core';
import Icon from '../Icon';
import {useNavigate} from 'react-router-dom';
import Utils from '../../Utils';
import appManager from "../../../common/service/AppManager";
import {Stream} from "../../service/Stream";

const MeetingSettingsComponent = (props) => {
  const userVideo = useRef();
  const [stream, setStream] = useState();
  const [videoOptionDisabled, setVideoOptionDisabled] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
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
      stream.enableVideo(!videoMuted);
    }
  }, [videoMuted]);

  const setupStream = () => {
    let videoStream = new Stream();
    videoStream.init(true, false, (stream) => {
      userVideo.current.srcObject = stream;
      setVideoOptionDisabled(false);
    }, (e) => {
      //setVideoOptionDisabled(true);
    });

    setStream(videoStream);
  };

  useEffect(() => {
    setupStream();
    let userDetails = appManager.getUserDetails();
    setLoggedInUser(userDetails.name)
  }, []);

  const muteVideo = () => {
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const muteAudio = () => {
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const closeStreams = () => {
    stream.close();
  };

  const close = () => {
    closeStreams();
    navigate("/view/calendar");
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
            <td className={'title'} colSpan={3}>
              {selectedMeeting.title}
            </td>
          </tr>
          <tr>
            <td style={{paddingBottom: '16px'}} colSpan={3}>
              Please select your audio and video settings
            </td>
          </tr>
          <tr>
            <td className={'lobby-settings'} colSpan={3}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {
                  videoMuted &&
                  <div className={'centered-flex-box'} style={{width: '100%', height: '100%'}}>
                    <div className={'avatar'} data-label={Utils.getInitials(loggedInUser)}/>
                  </div>
                }
                <video
                  hidden={videoMuted}
                  muted playsInline autoPlay ref={userVideo}
                  style={{width: '100%', height: '100%'}}
                />
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
                disabled={videoOptionDisabled}
                value={videoMuted}
                defaultChecked
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
                defaultChecked
                color="primary"
              />
            </td>
            <td style={{paddingTop: '8px', textAlign: 'right'}}>
              <Button
                variant={'contained'}
                size="large"
                color={'primary'}
                onClick={(e) => {
                  let userDetails = appManager.getUserDetails();
                  let isHost = false;
                  selectedMeeting.attendees.forEach(att => {
                    if (att.userId === userDetails.userId) {
                      isHost = att.type === 'HOST';
                    }
                  });

                  close();

                  navigate("/view/meetingRoom", {
                    state: {
                      displayMode: 'window',
                      selectedMeeting: selectedMeeting,
                      videoMuted: videoMuted,
                      audioMuted: audioMuted,
                      isHost
                    }
                  })
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
