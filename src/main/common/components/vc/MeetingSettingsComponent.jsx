import React, { useCallback, useEffect, useRef, useState } from 'react';
import './MettingSettingsComponent.css';
import Button from '@material-ui/core/Button';
import { Switch } from '@material-ui/core';
import Icon from '../Icon';
import { useNavigate } from 'react-router-dom';

const MeetingSettingsComponent = (props) => {
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const [lobbySettings] = useState({
    enableAudio: false,
    enableVideo: false
  });

  const { selectedMeeting } = props;

  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  const getLocalStream = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 240,
          height: 240,
        },
      });

      localStreamRef.current = localStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    } catch (e) {
      console.log(`getUserMedia error: ${e}`);
    }
  }, []);

  useEffect(() => {
    getLocalStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocalStream]);

  return (
    <div className={'meeting-container'}>
      <div className="toolbar row">
        <Button
          variant={'text'}
          size="large"
          style={{ color: '#985F31', border: '1px solid #985F31' }}
        >
          CLOSE
        </Button>
      </div>
      <div className={'content row'}>
        <table>
          <tr>
            <td className={'title'} colSpan={3}>
              {selectedMeeting.title}
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: '16px' }} colSpan={3}>
              Please select your audio and video settings
            </td>
          </tr>
          <tr>
            <td className={'lobby-settings'} colSpan={3}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <video
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                  muted={true}
                  ref={localVideoRef}
                  autoPlay={false}
                  id={'lobby-video'}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ paddingTop: '8px', textAlign: 'right' }}>
              {!lobbySettings.enableVideo ? (
                <Icon id={'CAMERA_OFF'} />
              ) : (
                <Icon id={'CAMERA'} />
              )}
              <Switch
                onChange={(e, value) => {
                  lobbySettings.enableVideo = value;

                  if (!lobbySettings.enableVideo) {
                    let videoElement = document.getElementById('lobby-video');
                    if (videoElement) {
                      videoElement.pause();
                      videoElement.style.display = 'none';
                    }
                  } else {
                    let videoElement = document.getElementById('lobby-video');
                    if (videoElement) {
                      videoElement.play();
                      videoElement.style.display = 'inherit';
                    }
                  }
                }}
                value={lobbySettings.enableVideo}
                color="primary"
              />
            </td>
            <td style={{ paddingTop: '8px', textAlign: 'left' }}>
              {!lobbySettings.enableAudio ? (
                <Icon id={'MIC_OFF'} />
              ) : (
                <Icon id={'MIC'} />
              )}
              <Switch
                onChange={(e, value) => {
                  lobbySettings.enableAudio = value;
                }}
                value={lobbySettings.enableAudio}
                color="primary"
              />
            </td>
            <td style={{ paddingTop: '8px', textAlign: 'right' }}>
              <Button
                variant={'contained'}
                size="large"
                color={'primary'}
                onClick={(e) => {
                  let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
                  let isHost = false;
                  selectedMeeting.attendees.forEach(att => {
                    if (att.userId === userDetails.userId ) {
                      isHost = att.type === 'HOST';
                    }
                  })

                  navigate("/view/meetingRoom", {
                    state: {
                      selectedMeeting: selectedMeeting,
                      settings: lobbySettings,
                      isHost
                    }
                  })
                }}
              >
                JOIN
              </Button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default MeetingSettingsComponent;
