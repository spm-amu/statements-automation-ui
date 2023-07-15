/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './MeetingParticipant.css'
import Utils from '../../../Utils';
import {MessageType, SystemEventType} from "../../../types";
import appManager from "../../../../common/service/AppManager";
import socketManager from "../../../../common/service/SocketManager";
import mediaRecorder from "./MeetingRoomRecorder";
import mediaSoupHelper from "./MediaSoupHelper";
import {Buffer} from "buffer/";
import Tracks from "./Tracks";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../../Icon";
import {PanTool} from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";

export const VIDEO_CODEC_OPTIONS = {
  videoGoogleStartBitrate: 1000
};

export const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    width: {
      min: 640,
      ideal: 1920
    },
    height: {
      min: 400,
      ideal: 1080
    }
  }
};

export const VIDEO_ENCODINGS = [
  {
    rid: 'r0',
    maxBitrate: 20000,
    //scaleResolutionDownBy: 10.0,
    scalabilityMode: 'S1T3'
  },
  {
    rid: 'r1',
    maxBitrate: 150000,
    scalabilityMode: 'S1T3'
  },
  {
    rid: 'r2',
    maxBitrate: 450000,
    scalabilityMode: 'S1T3'
  }
];

const MeetingParticipant = (props) => {
  const [handRaised, setHandRaised] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(props.audioMuted);
  const [videoRefresher, setVideoRefresher] = React.useState(false);
  const [producers] = React.useState(new Map());
  const [failedProducersDueToNullTransport] = React.useState([]);
  const [consumers] = React.useState(new Map());
  const [soundLevel, setSoundLevel] = React.useState(0);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const videoRef = useRef();
  const videoStream = useRef();
  const audioRef = useRef();
  const tracks = useRef(new Tracks());
  const soundLevelCounter = useRef(0);
  const showVideo = true;
  const {consumerTransport, producerTransport, device} = props;
  const {numberOfInViewParticipants} = props;

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
          case MessageType.NEW_PRODUCERS:
            onNewProducers(be.payload);
            break;
          case MessageType.CONSUMER_CLOSED:
            if (consumers.has(be.payload.consumerId)) {
              removeConsumer(be.payload.consumerId, be.payload.kind);
            }
            break;
        }
      }
    }
  };

  const onRaiseHand = (payload) => {
    if (payload && payload.userId === props.data.userId) {
      setHandRaised(true);
      props.data.handRaised = true;
    }
  };

  const onLowerHand = (payload) => {
    if (payload && payload.userId === props.data.userId) {
      setHandRaised(false);
      props.data.handRaised = false;
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
    if (videoRef.current && videoStream.current) {
      videoRef.current.srcObject = videoStream.current;
    }
  }, [videoRef.current]);

  useEffect(() => {
    if (props.soundMonitor && !props.inView) {
      if (soundLevel > 3) {
        soundLevelCounter.current = 10;
      } else if (soundLevelCounter.current > 0) {
        soundLevelCounter.current--;
      }

      props.soundMonitor(props.data.userId, soundLevelCounter.current === 0 || audioMuted);
    }
  }, [soundLevel]);

  useEffect(() => {
    if (audioMuted) {
      setSoundLevel(0);
      if (props.soundMonitor && !props.inView) {
        props.soundMonitor(props.data.userId, true);
      }
    }
  }, [audioMuted]);

  const onAVSettingsChange = (payload) => {
    if (props.data.userId === payload.userId) {
      if (props.isCurrentUser) {
        if (payload.audioMuted) {
          stopProducing('audio');
        } else {
          if (device) {
            produce('audio');
          }
        }

        if (payload.videoMuted) {
          stopProducing('video');
        } else {
          if (device) {
            produce('video');
          }
        }
      }

      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);

    } else if (props.isCurrentUser) {

    }
  };

  useEffect(() => {
  }, [props.data]);

  useEffect(() => {
    if (producerTransport) {
      if (props.videoMuted) {
        stopProducing('video');
      } else {
        produce('video');
      }

      if (props.audioMuted) {
        stopProducing('audio');
      } else {
        produce('audio');
      }
    }
  }, [producerTransport]);

  useEffect(() => {
    if (consumerTransport) {
      console.log("TRANSI ARRIVED WITH PRODUCERS : ", props.data.producers);
      if (props.data.producers) {
        onNewProducers(props.data.producers, true);
      }

      onNewProducers(failedProducersDueToNullTransport, true);
      failedProducersDueToNullTransport.splice(0, failedProducersDueToNullTransport.length);

      if(producers) {
        console.log("RE-INSTATING CONSUMERS");
        for (let [key, value] of producers) {
          console.log("PROCESSING PRODUCER OF TYPE : " + key + " : " + value.id);
          if(!(props.data.producers && this.props.data.producers.find((p) => p.producerId === value.id))) {
            consume(value.id, key, true);
          } else {
            console.log("PRODUCER ALREADY PROCESSED");
          }
        }
      }
    }
  }, [consumerTransport]);

  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND, MessageType.NEW_PRODUCERS, MessageType.CONSUMER_CLOSED);

    return () => {
      console.log("======================DESTROYING PARTICIPANT========================= : " + props.data.userId);

      if(props.isCurrentUser) {
        stopProducing('audio');
        stopProducing('video');
      }

      /*if(videoStream.current) {
        alert("I got vibes : " + videoStream.current.)
      }*/

      for (let [key, value] of consumers) {
        removeConsumer(key, 'video');
      }

      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const produce = async (type) => {
    /*let deviceId;

    navigator.mediaDevices.enumerateDevices().then((devices) =>
      devices.forEach((device) => {
        if ('videoinput' === device.kind) {
          deviceId = device.deviceId;
        }
      })
    );*/

    if (!device) {
      console.error('No available device');
      return;
    }

    if (!device.canProduce('video') && type === 'video') {
      console.error('Cannot produce video');
      return;
    }

    if (producers.has(type)) {
      console.log('Producer already exists for this type ' + type);
      return
    }

    let mediaConstraints;
    switch (type) {
      case 'audio':
        mediaConstraints = {
          audio: true,
          video: false
        };

        break;
      case 'video':
        mediaConstraints = VIDEO_CONSTRAINTS;
        break;
      default:
        return;
    }

    let stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    const track = type === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    const params = {
      track
    };

    audioRef.current = stream;
    if (props.isHost && type === 'audio') {
      mediaRecorder.addTrack(track);
      tracks.current.setAudioTrack(track);
    }

    if (type === 'video') {
      params.encodings = VIDEO_ENCODINGS;
      params.codecOptions = VIDEO_CODEC_OPTIONS;
      tracks.current.setVideoTrack(track);
    }

    let producer = await producerTransport.produce(params);
    producerTransport.getStats().then((data) => console.log(data));
    producers.set(type, producer);

    if (type === 'video') {
      videoRef.current.srcObject = stream;
      videoStream.current = stream;
      setVideoRefresher(!videoRefresher);
    }

    producer.on('transportclose', () => {
      stream.srcObject.getTracks().forEach(function (track) {
        track.stop()
      });

      producers.delete(type)
    });

    producer.on('close', () => {
      stream.srcObject.getTracks().forEach(function (track) {
        track.stop()
      });

      producers.delete(type)
    });
  };

  const stopProducing = (type) => {
    if (!producers.has(type)) {
      console.log('There is no producer for this type ' + type);
      return;
    }

    let producerId = producers.get(type).id;
    console.log('Close producer', producerId);

    socketManager.emitEvent(MessageType.PRODUCER_CLOSED, {
      userId: props.data.userId,
      producerId,
      roomId: props.meetingId
    }).catch((e) => console.log("PRODUCER_CLOSED ERROR : ", e));

    producers.get(type).close();
    producers.delete(type);

    if (type === 'video') {
      tracks.current.stopVideoTrack();
    }

    if (props.isHost && type === 'audio') {
      mediaRecorder.removeTrack(tracks.current.getAudioTrack());
    }
  };

  const onNewProducers = (producers, loading = false) => {
    for (const producer of producers) {
      if (consumerTransport) {
        if (producer.userId === props.data.userId) {
          if (producer.kind === 'video' && !producer.screenSharing) {
            console.log("CALLING CONSUME FROM ON NEW PRODUCERS FOR : " + props.data.userId + " - " + producer.producerId);
            consume(producer.producerId, producer.kind);
          }
        }

        if (props.isCurrentUser || loading) {
          // The small participant box at the bottom belonging to the current user must consume all audio
          // This is because we do not want to disturb the audio due to any rendering such as Bring to view
          if (producer.kind === 'audio') {
            consume(producer.producerId, producer.kind, loading);
          }
        }
      } else {
        failedProducersDueToNullTransport.push(producer);
      }
    }
  };

  const removeConsumer = (consumerId, kind) => {
    if (kind === 'video') {
      if (videoStream.current) {
        if (videoStream.current) {
          videoStream.current.getTracks().forEach(function (track) {
            track.stop();
          })
        }
      }
    } else if (kind === 'audio') {
      let audioElement = document.getElementById(consumerId);
      if (audioElement && audioElement.srcObject) {
        audioElement.srcObject.getTracks().forEach(function (track) {
          track.stop();
          if (mediaRecorder) {
            mediaRecorder.removeTrack(track);
          }
        });

        document.getElementById(props.data.userId + '-audio-el-container')?.removeChild(audioElement)
      }
    }

    consumers.delete(consumerId);
  };

  const consume = async (producerId, kind, loading) => {
    mediaSoupHelper.getConsumeStream(producerId, device.rtpCapabilities, consumerTransport, props.meetingId, appManager.getUserDetails().userId, kind).then(
      ({consumer, stream, kind}) => {
        if (consumer) {
          consumers.set(consumer.id, consumer);

          console.log("\n\n\n=====================================CONSUME===================================== : " + kind + " FOR : " + props.data.userId);
          if (kind === 'video') {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }

            videoStream.current = stream;

            setVideoMuted(false);
            setVideoRefresher(!videoRefresher);
            tracks.current.setVideoTrack(stream.getVideoTracks()[0]);
          } else {
            if (props.isCurrentUser || loading) {
              let audioElement = document.createElement('audio');
              audioElement.srcObject = stream;
              audioElement.id = consumer.id;
              audioElement.playsinline = false;
              audioElement.autoplay = true;
              document.getElementById('meeting-audio-el-container').appendChild(audioElement);

              if (props.isHost) {
                mediaRecorder.addTrack(stream.getAudioTracks()[0]);
              }
            }
          }

          consumer.on(
            'trackended',
            () => {
              removeConsumer(consumer.id, kind)
            }
          );

          consumer.on(
            'transportclose',
            () => {
              removeConsumer(consumer.id, kind)
            }
          )
        }
      }
    )
  };

  const getParticipantName = () => {
    let name = props.data.name;

    if (Utils.isNull(props.data.userId)) {
      name = `${name} (Guest)`;
    }

    return name;
  };

  return (
    <>
      {
        <div className={'col-*-* meeting-participant-container'}
             style={{
               padding: props.padding ? props.padding : null,
               height: props.height ? props.height : null,
               color: 'white',
               position: 'relative'
             }}>
          {
            <>
              {
                (videoMuted || !videoRef.current || !videoRef.current.srcObject) &&
                <div className={'centered-flex-box'}
                     style={{
                       width: '100%',
                       height: '100%',
                       marginBottom: props.sizing === 'sm' ? '8px' : 0
                     }}>
                  {
                    <div className={props.sizing === 'sm' ? 'avatar-wrapper-sm' : 'avatar-wrapper'}
                         style={{
                           width: ((props.sizing === 'sm' ? 72 : 112) + soundLevel / 10) + 'px',
                           height: ((props.sizing === 'sm' ? 72 : 112) + soundLevel / 10) + 'px',
                           border: !audioMuted && soundLevel > 3 ? (props.sizing === 'sm' ? 2 : 4) + 'px solid #00476a' : 'none'
                         }}>
                      <div
                        className={props.sizing === 'md' ? 'avatar avatar-md' : props.sizing === 'sm' ? 'avatar avatar-sm' : 'avatar'}
                        data-label={Utils.getInitials(props.data.name)}
                        style={
                          {
                            fontSize: props.sizing === 'sm' ? '20px' : null
                          }
                        }/>
                    </div>
                  }
                </div>
              }
              {
                <video
                  id={props.data.userId + '-video'}
                  width={640}
                  height={320}
                  autoPlay ref={videoRef} muted
                  style={{
                    width: '100%',
                    height: '100%',
                    zIndex: '0',
                    display: (videoMuted || !videoRef.current || !videoRef.current.srcObject) ? 'none' : null
                  }}
                />
              }
              {
                /*We need this element to capture recording sound*/
                props.isHost &&
                <audio
                  id={props.data.userId + '-audio'}
                  autoPlay ref={audioRef} muted
                  style={{
                    display: 'none'
                  }}
                />
              }
              <div className={props.sizing === 'sm' ? 'name-label-sm' : 'name-label'}
                   style={
                     {
                       position: 'absolute',
                       bottom: '0',
                       padding: props.isCurrentUser || props.sizing !== 'sm' ? '16px' : '4px'
                     }
                   }>
                {!props.isCurrentUser ? getParticipantName() : 'You'}
                {
                  !props.isCurrentUser &&
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
                      props.data.inView && numberOfInViewParticipants > 1 &&
                      <Tooltip title="Remove from view">
                        <IconButton
                          onClick={(e) => {
                            stopProducing('video');
                            props.onRemoveFromView(props.data)
                          }}
                          style={{
                            marginRight: '4px',
                            width: '16px',
                            height: '16px',
                            color: 'white'
                          }}
                        >
                          <Icon id={'CLOSE'}/>
                        </IconButton>
                      </Tooltip>
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
                  !props.isCurrentUser &&
                  <span style={{marginLeft: '4px'}}>
                          {handRaised && <PanTool fontSize={'small'} style={{color: '#e2b030'}}/>}
                        </span>
                }
              </div>
              {
                props.isCurrentUser &&
                <div id={'meeting-audio-el-container'}>
                </div>
              }
            </>
          }
        </div>
      }
    </>
  )
};

export default MeetingParticipant;
