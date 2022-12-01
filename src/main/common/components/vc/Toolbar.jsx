/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import './Toolbar.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from "../../Utils";

const Toolbar = (props) => {
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [isRecording, setIsRecording] = useState(false);
  const [screenShared, setScreenShared] = useState(false);

  const {
    userStream,
    userVideo,
    eventHandler,
    handRaised,
    step
  } = props;

  const muteVideo = () => {
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const toggleRecorder = () => {
    setIsRecording((prevStatus) => !prevStatus);
  };

  useEffect(() => {
    if (!isRecording) {
      eventHandler.stopRecording(isRecording);
    } else {
      eventHandler.recordMeeting(isRecording)
    }
  }, [isRecording]);

  useEffect(() => {
    eventHandler.onMuteVideo(videoMuted);
  }, [videoMuted]);

  useEffect(() => {
    eventHandler.onMuteAudio(audioMuted);
  }, [audioMuted]);

  const muteAudio = () => {
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const shareScreen = () => {
    eventHandler.shareScreen();
  };

  const stopShareScreen = () => {
    eventHandler.stopShareScreen();
  };

  const endCall = () => {
    eventHandler.endCall();
  };

  const showPeople = () => {
    eventHandler.showPeople()
  };

  const showChat = () => {
    eventHandler.showChat()
  };

  const raiseHand = () => {
    eventHandler.raiseHand()
  };

  const lowerHand = () => {
    eventHandler.lowerHand()
  };

	return (
    <div className={'footer-toolbar'}>
      <div className={'row centered-flex-box'}>

        <IconButton
          onClick={() => {
            toggleRecorder();
          }}
          style={{
            backgroundColor: isRecording ? '#eb3f21' : '#404239',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'RECORD'}/>
        </IconButton>

        {!screenShared && (
          <IconButton
            onClick={() => {
                muteVideo();
            }}
            style={{
              backgroundColor: videoMuted ? "#eb3f21" : "#404239",
              color: 'white',
              marginRight: '4px'
            }}
          >
            {videoMuted ? (
              <Icon id={'VIDEOCAM_OFF'}/>
            ) : (
              <Icon id={'VIDEOCAM'}/>
            )}
          </IconButton>
        )}

        <IconButton
          onClick={() => {
              muteAudio();
          }}
          style={{
            backgroundColor: audioMuted ? "#eb3f21" : "#404239",
            color: 'white',
            marginRight: '4px'
          }}
        >
          {audioMuted ? (
            <Icon id={'MIC_OFF'}/>
          ) : (
            <Icon id={'MIC'}/>
          )}
        </IconButton>
        {" "}
        <IconButton
          onClick={() => {
              if (screenShared) {
                stopShareScreen();
              } else {
                shareScreen();
              }
          }}
          style={{
            backgroundColor: screenShared ? '#8eb2f5' : '#404239',
            color: 'white',
            marginRight: '4px'
          }}
        >
          {screenShared ? (
            <Icon id={'CANCEL_PRESENTATION'}/>
          ) : (
            <Icon id={'PRESENT_TO_ALL'}/>
          )}
        </IconButton>
        {
          step === 'SESSION' &&
          <IconButton
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
            onClick={(e) => showChat()}
          >
            <Icon id={'CHAT_BUBBLE'}/>
          </IconButton>

        }
        <IconButton
          onClick={endCall}
          style={{
            backgroundColor: '#eb3f21',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'CALL_END'}/>
        </IconButton>
        {
          step === 'SESSION' &&
          <IconButton
            onClick={(e) => showPeople()}
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
          >
            <Icon id={'PEOPLE'}/>
          </IconButton>
        }

        <IconButton
          onClick={(e) => {
            if(handRaised) {
              lowerHand();
            } else {
              raiseHand();
            }
          }}
          style={{
            backgroundColor: '#404239',
            color: handRaised ? '#e2b030' : 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'PAN_TOOL'}/>
        </IconButton>
      </div>
    </div>
  );
};

export default Toolbar;
