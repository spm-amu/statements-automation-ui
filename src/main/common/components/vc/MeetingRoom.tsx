import { useCallback, useEffect, useRef, useState } from 'react';
import './MettingRoom.css';
import Button from '@material-ui/core/Button';
import { Switch } from '@material-ui/core';
import Icon from '../Icon';

const MeetingRoom = (props) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();
  const [lobbySettings] = useState({});

  const handleLeaveMeeting = (e) => {
    // TODO : Do all the leave meeting calls
    props.closeHandler(e);
  };

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
          onClick={(e) => handleLeaveMeeting(e)}
          style={{ color: '#985F31', border: '1px solid #985F31' }}
        >
          CLOSE
        </Button>
      </div>
      <div className={'content row'}>
        <table>
          <tr>
            <td className={'title'} colSpan={3}>
              {props.meeting.title}
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
                onClick={(e) => handleLeaveMeeting(e)}
                color={'primary'}
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

export default MeetingRoom;
