import React, {useCallback, useEffect, useRef, useState} from 'react';
import './MettingSettingsComponent.css';
import Button from '@material-ui/core/Button';
import {Switch} from '@material-ui/core';
import Icon from '../Icon';
import {useNavigate} from 'react-router-dom';
import Utils from '../../Utils';

const MeetingSettingsComponent = (props) => {
  const userStream = useRef();
  const userVideo = useRef();
  const audioTrack = useRef();
  const videoTrack = useRef();

  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [currentUserStream, setCurrentUserStream] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState('');

  const {selectedMeeting} = props;

  const navigate = useNavigate();

  const localVideoStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: 240,
          height: 240,
        },
      })
      .then((myStream) => {
        userStream.current = myStream;
        videoTrack.current = userStream.current.getTracks()[1];
        audioTrack.current = userStream.current.getTracks()[0];

        setCurrentUserStream(myStream);
        userVideo.current.srcObject = myStream;
      });
  };

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = currentUserStream;
    }
  }, [currentUserStream]);

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = currentUserStream;
    }
  }, [userVideo.current]);

  useEffect(() => {
    localVideoStream();

    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    setLoggedInUser(userDetails.name)
  }, []);

  const muteVideo = () => {
    if (userVideo.current.srcObject) {
      videoTrack.current.enabled = !videoTrack.current.enabled;
    }
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const muteAudio = () => {
    if (userVideo.current.srcObject) {
      audioTrack.current.enabled = !audioTrack.current.enabled;
    }
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const close = () => {

    // stop all tracks - audio and video
    if (userStream.current) {
      userStream.current
        .getTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop()
        });
    }

    if (videoTrack.current) {
      videoTrack.enabled = false;
      videoTrack.current.stop();
    }

    if (audioTrack.current) {
      audioTrack.current.enabled = false;
      audioTrack.current.stop();
    }

    navigate("/view/calendar");
  };

  return (
    <div className={'meeting-container'}>
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
                      <div className={'avatar'} data-label={Utils.getInitials(loggedInUser)} />
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
                  if (userStream.current) {
                    muteVideo();
                  }
                }}
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
                  if (userStream.current) {
                    muteAudio();
                  }
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
                  let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
                  let isHost = false;
                  selectedMeeting.attendees.forEach(att => {
                    if (att.userId === userDetails.userId) {
                      isHost = att.type === 'HOST';
                    }
                  });

                  close();

                  navigate("/view/meetingRoom", {
                    state: {
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
