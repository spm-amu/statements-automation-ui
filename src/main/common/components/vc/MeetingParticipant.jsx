/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './MeetingParticipant.css'
import Utils from '../../Utils';
import {MessageType, SystemEventType} from "../../types";
import appManager from "../../../common/service/AppManager";
import socketManager from "../../../common/service/SocketManager";
import {Buffer} from "buffer/";
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";

const MeetingParticipant = (props) => {
  const [active, setActive] = React.useState(props.active);
  const [handRaised, setHandRaised] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(props.audioMuted);
  const [soundLevel, setSoundLevel] = React.useState(0);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const videoRef = useRef();
  const showVideo = true;

  const handler = () => {
    return {
      get id() {
        return 'meeting-participant-' + props.data.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.RAISE_HAND:
            onRaiseHand(be.payload);
            break;
          case MessageType.LOWER_HAND:
            onLowerHand(be.payload);
            break;
        }
      }
    }
  };

  const onRaiseHand = (payload) => {
    if (payload && payload.userId === props.data.userId) {
      setHandRaised(true);
    }
  };

  const onLowerHand = (payload) => {
    if (payload && payload.userId === props.data.userId) {
      setHandRaised(false);
    }
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'meeting-participant-' + props.data.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED:
            onAVSettingsChange(be);
            break;
        }
      }
    }
  };

  useEffect(() => {
    eventHandler.api = handler();
    systemEventHandler.api = systemEventHandlerApi();
  });

  useEffect(() => {
    setVideoMuted(props.videoMuted);
  }, [props.videoMuted]);

  useEffect(() => {
    if(props.soundMonitor && !props.active) {
      props.soundMonitor(props.data.userId, soundLevel > 3);
    }
  }, [soundLevel]);

  useEffect(() => {
    setAudioMuted(props.audioMuted);
    if (props.audioMuted) {
      setSoundLevel(0);
    }
  }, [props.audioMuted]);

  useEffect(() => {
    setActive(props.active);
  }, [props.active]);

  const onAVSettingsChange = (payload) => {
    if (props.data.userId === payload.userId) {
      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);
    }
  };

  useEffect(() => {
    if (props.data.peer) {
      videoRef.current.srcObject = props.data.stream;
      props.data.peer.on('data', data => {
        let dataJSON = JSON.parse("" + data);

        if(dataJSON.userId === props.data.userId) {
          console.log(dataJSON.data.level);
          setSoundLevel(dataJSON.data.level);
        }
      });
    } else {
      videoRef.current.srcObject = props.userStream;
    }
  }, [props.data]);

  useEffect(() => {
    if(videoRef.current) {
      if (props.data.peer) {
        videoRef.current.srcObject = props.data.stream;
      } else {
        videoRef.current.srcObject = props.userStream;
      }
    }
  }, [videoRef.current]);


  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);

      if (props.data.peer) {
        props.data.peer.removeAllListeners('data')
      }
    };
  }, []);

  useEffect(() => {
    if (props.refChangeHandler) {
      props.refChangeHandler(videoRef);

      if (videoRef.current) {
        console.log(props.userStream);
        videoRef.current.srcObject = props.userStream;
      }
    }
  }, [videoRef.current, props.userStream]);

  const computeParticipantName = () => {
    let name = props.data.name;

    if (Utils.isNull(props.data.userId)) {
      name = `${name} (Guest)`;
    }

    return name;
  };

  return (
    <>
      {
        !active ?
          audioMuted || props.data.peer === null ?
            <audio autoPlay muted ref={videoRef}/>
            :
            <audio autoPlay ref={videoRef}/>
          :
          <div className={'col-*-* meeting-participant-container'}
               style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null}}>
            <div style={{width: '100%', height: '100%'}}>
              {
                showVideo ?
                  <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
                    {
                      videoMuted &&
                      <div className={'centered-flex-box'} style={{width: '100%', height: '100%', marginBottom: props.sizing === 'sm' ? '8px' : 0}}>
                        {
                          <div className={'avatar-wrapper'}
                               style={{
                                 width: ((props.sizing === 'sm' ? 1 : 3) + soundLevel / 10) + 'em',
                                 height: ((props.sizing === 'sm' ? 1 : 3) + soundLevel / 10) + 'em',
                                 border: !audioMuted && soundLevel > 3 ? (props.sizing === 'sm' ? 2 : 4) + 'px solid #00476a' : 'none'
                               }}>
                            <div className={props.sizing === 'md' ? 'avatar avatar-md' : 'avatar'} data-label={Utils.getInitials(props.data.name)}
                                 style={
                                   {
                                     fontSize: props.sizing === 'sm' ? '14px' : null
                                   }
                                 }/>
                          </div>
                        }
                      </div>
                    }
                    {
                      audioMuted || props.data.peer === null ?
                        <video
                          id={props.data.userId}
                          hidden={videoMuted}
                          autoPlay muted playsInline ref={videoRef}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: !audioMuted && soundLevel > 3 ? '4px solid #00476a' : 'none'
                          }}
                        />
                        :
                        <video
                          id={props.data.userId}
                          hidden={videoMuted}
                          autoPlay playsInline ref={videoRef}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: !audioMuted && soundLevel > 3 ? '4px solid #00476a' : 'none'
                          }}
                        />
                    }
                    <div className={props.sizing === 'sm' ? 'name-label-sm' : 'name-label'}>
                      {props.showName ? computeParticipantName() : 'You'}
                      {
                        props.showName &&
                        <span style={{marginLeft: '4px'}}>
                    {
                      props.isHost && !audioMuted ?
                        <IconButton
                          onClick={(e) => {
                            props.onHostAudioMute(props.data)
                          }}
                          style={{
                            marginRight: '4px',
                            width: '16px',
                            height: '16px',
                            color: 'white'
                          }}
                        >
                          <Icon id={'MIC'}/>
                        </IconButton>
                        :
                        <>
                          {audioMuted ? (
                            <Icon id={'MIC_OFF'}/>
                          ) : (
                            <Icon id={'MIC'}/>
                          )}
                        </>
                    }
                          {
                            props.isHost && !videoMuted &&
                            <IconButton
                              onClick={(e) => {
                                props.onHostVideoMute(props.data)
                              }}
                              style={{
                                marginRight: '4px',
                                width: '16px',
                                height: '16px',
                                color: 'white'
                              }}
                            >
                              <Icon id={'CAMERA'}/>
                            </IconButton>
                          }
                  </span>
                      }
                      {
                        props.showName &&
                        <span style={{marginLeft: '4px'}}>
                    {handRaised && <PanTool fontSize={'small'} style={{color: '#e2b030'}}/>}
                  </span>
                      }
                    </div>
                  </div>
                  :
                  <div className={'h-100'} style={{backgroundColor: 'rgb(40, 40, 43)'}}>
                    <div style={{width: '100%', height: '100%'}}>
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        {
                          audioMuted || props.data.peer === null ?
                            <audio autoPlay muted ref={videoRef}/>
                            :
                            <audio autoPlay ref={videoRef}/>
                        }
                        <img src={props.data.avatar}
                             style={{
                               width: props.sizing === 'sm' ? '40px' : '80px',
                               height: props.sizing === 'sm' ? '40px' : '80px',
                               borderRadius: '50%',
                               backgroundColor: '#FFFFFF'
                             }} alt={}/>
                      </div>
                    </div>
                    <div className={'name-label'}>
                      {
                        props.showName ? props.data.name : 'You'
                      }
                    </div>
                  </div>
              }
            </div>
          </div>
      }
    </>
  )
};

export default MeetingParticipant;
