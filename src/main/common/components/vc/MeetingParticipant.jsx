/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './MeetingParticipant.css'
import Utils from '../../Utils';
import Icon from '../Icon';
import {PanTool} from '@material-ui/icons';
import IconButton from "@material-ui/core/IconButton";
import {MessageType, SystemEventType} from "../../types";
import appManager from "../../../common/service/AppManager";
import socketManager from "../../service/SocketManager";

const MeetingParticipant = (props) => {
  const [handRaised, setHandRaised] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(props.audioMuted);
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
    if(payload && payload.userId === props.data.userId) {
      setHandRaised(true);
    }
  };

  const onLowerHand = (payload) => {
    if(payload && payload.userId === props.data.userId) {
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
    setVideoMuted(props.audioMuted);
  }, [props.audioMuted]);

  const onAVSettingsChange = (payload) => {
    if (props.data.userId === payload.userId) {
      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);
    }
  };

  useEffect( () => {
    if (props.data.peer) {
      videoRef.current.srcObject = props.data.stream;
      /*props.data.stream.getAudioTracks()[0].addEventListener("mute", (event) => {
        console.log(props.data.userId + " : muted");
      });

      props.data.stream.getAudioTracks()[0].onmute = (event) => {
        console.log(props.data.userId + " : muted 123");
      };

      props.data.stream.getAudioTracks()[0].addEventListener("unmute", (event) => {
        console.log(props.data.userId + " : unmuted");
      });*/
    } else {
      videoRef.current.srcObject = props.userStream;
    }
  }, [props.data]);

  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  useEffect(() => {
    if (props.refChangeHandler) {
      props.refChangeHandler(videoRef);

      if (videoRef.current) {
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
    <div className={'col-*-* meeting-participant-container'}
         style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null}}>
      <div style={{width: '100%', height: '100%'}}>
        {
          showVideo ?
            <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
              {
                videoMuted &&
                <div className={'centered-flex-box'} style={{width: '100%', height: '100%'}}>
                  <div className={'avatar'} data-label={Utils.getInitials(props.data.name)}
                       style={
                         {
                           width: props.sizing === 'sm' ? '52px' : null,
                           height: props.sizing === 'sm' ? '52px' : null,
                           fontSize: props.sizing === 'sm' ? '14px' : null,
                           marginBottom: props.sizing === 'sm' ? '16px' : null
                         }
                       }/>
                </div>
              }
              {
                audioMuted || props.data.peer === null ?
                  <video
                    id={props.data.userId}
                    hidden={videoMuted}
                    muted playsInline autoPlay ref={videoRef}
                    style={{width: '100%', height: '100%'}}
                  />
                  :
                  <video
                    id={props.data.userId}
                    hidden={videoMuted}
                    playsInline autoPlay ref={videoRef}
                    style={{width: '100%', height: '100%'}}
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
                  <img src={props.data.avatar}
                       style={{
                         width: props.sizing === 'sm' ? '40px' : '80px',
                         height: props.sizing === 'sm' ? '40px' : '80px',
                         borderRadius: '50%',
                         backgroundColor: '#FFFFFF'
                       }}/>
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
      {
        /*props.showName &&
        <div className={'name-label'}>
          {
            props.data.name
          }
        </div>*/

      }
    </div>
  )

};

export default MeetingParticipant;
