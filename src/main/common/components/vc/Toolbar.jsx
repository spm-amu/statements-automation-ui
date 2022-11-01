/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import './Toolbar.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from "../../Utils";

const Toolbar = (props) => {
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [screenShared, setScreenShared] = useState(false);

  const {
    userStream,
    userVideo,
    eventHandler,
    handRaised
  } = props;

  const muteVideo = () => {
    let videoTrack = userStream.getTracks()[1];
    if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
      if (!screenShared) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }

    setVideoMuted((prevStatus) => !prevStatus);
  };

  useEffect(() => {
    eventHandler.onMuteVideo(videoMuted);
  }, [videoMuted]);

  useEffect(() => {
    eventHandler.onMuteAudio(audioMuted);
  }, [audioMuted]);

  const muteAudio = () => {
    let audioTrack = userStream.getTracks()[0];
    if (!Utils.isNull(userVideo.current) && userVideo.current.srcObject) {
      audioTrack.enabled = !audioTrack.enabled;
    }

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
