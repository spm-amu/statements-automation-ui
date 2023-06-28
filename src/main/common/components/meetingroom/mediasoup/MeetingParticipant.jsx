/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './MeetingParticipant.css'
import Utils from '../../../Utils';
import {MessageType, SystemEventType} from "../../../types";
import appManager from "../../../../common/service/AppManager";
import socketManager from "../../../../common/service/SocketManager";
import mediaSoupHelper from "./MediaSoupHelper";
import {Buffer} from "buffer/";
import Tracks from "./Tracks";

const MeetingParticipant = (props) => {
  const [handRaised, setHandRaised] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(props.audioMuted);
  const [producers] = React.useState(new Map());
  const [consumers] = React.useState(new Map());
  const [soundLevel, setSoundLevel] = React.useState(0);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const videoRef = useRef();
  const audioRef = useRef();
  const tracks = useRef(new Tracks());
  const soundLevelCounter = useRef(0);
  const showVideo = true;
  const {consumerTransport, producerTransport, device} = props;

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
            //alert("NEW_PRODUCERS");
            onNewProducers(be.payload);
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
    setVideoMuted(props.videoMuted);
  }, [props.videoMuted]);

  useEffect(() => {
    setAudioMuted(props.audioMuted);
  }, [props.audioMuted]);

  useEffect(() => {
    if (props.soundMonitor && !props.inView) {
      if (soundLevel > 3) {
        soundLevelCounter.current = 10;
      } else if (soundLevelCounter.current > 0) {
        soundLevelCounter.current--;
      }

      props.soundMonitor(props.data.userId, soundLevelCounter.current === 0 || audioMuted);

      // Just ensuring that the src object is always set if there is incoming
      //videoRef.current.srcObject = props.data.stream;
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

  useEffect(() => {
  }, [videoMuted]);

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
    }
  };

  useEffect(() => {
  }, [props.data]);

  useEffect(() => {
    if (producerTransport) {
      if (videoMuted) {
        stopProducing('video');
      } else {
        produce('video');
      }

      if (audioMuted) {
        stopProducing('audio');
      } else {
        produce('audio');
      }
    }
  }, [producerTransport]);

  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND, MessageType.NEW_PRODUCERS);

    return () => {
      stopProducing('audio');
      stopProducing('video');
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const produce = async (type) => {
    let deviceId;

    navigator.mediaDevices.enumerateDevices().then((devices) =>
      devices.forEach((device) => {
        if ('videoinput' === device.kind) {
          deviceId = device.deviceId;
        }
      })
    );

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
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920
            },
            height: {
              min: 400,
              ideal: 1080
            },
            deviceId: deviceId
          }
        };
        break;
      default:
        return;
    }

    let stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    const track = type === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    const params = {
      track
    };

    if (type === 'video') {
      params.encodings = [
        {
          rid: 'r0',
          maxBitrate: 100000,
          //scaleResolutionDownBy: 10.0,
          scalabilityMode: 'S2T1'
        },
        {
          rid: 'r1',
          maxBitrate: 300000,
          scalabilityMode: 'S2T1'
        },
        {
          rid: 'r2',
          maxBitrate: 900000,
          scalabilityMode: 'S2T1'
        }
      ];

      params.codecOptions = {
        videoGoogleStartBitrate: 1000
      }
    }

    let producer = await producerTransport.produce(params);
    producerTransport.getStats().then((data) => console.log(data));
    producers.set(type, producer);

    if (type === 'audio') {
      if (!props.isCurrentUser) {
        audioRef.current.srcObject = stream;
      }
    } else {
      videoRef.current.srcObject = stream;
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

    if (type === 'audio') {
      if (!props.isCurrentUser) {
        tracks.current.stopAudioTrack();
      }
    } else {
      tracks.current.stopVideoTrack();
    }
  };

  const onNewProducers = (producers) => {
    for (const producer of producers) {
      alert(producer.kind);
      if (producer.userId === props.data.userId) {
        consume(producer.producerId);
      }
    }
  };

  const removeConsumer = (consumerId, type) => {
    let stream = type === 'video' ? videoRef.current.srcObject : audioRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop()
      })
    }

    consumers.delete(consumerId)
  };

  const consume = async (producerId) => {
    mediaSoupHelper.getConsumeStream(producerId, device.rtpCapabilities, consumerTransport, props.meetingId, appManager.getUserDetails().userId).then(
      ({consumer, stream, kind}) => {
        consumers.set(consumer.id, consumer);

        console.log("\n\n\n=====================================CONSUME===================================== : " + kind);
        if (kind === 'video') {
          videoRef.current.srcObject = stream;
          tracks.current.setVideoTrack(stream.getVideoTracks()[0]);
        } else {
          audioRef.current.srcObject = stream;
          tracks.current.setAudioTrack(stream.getAudioTracks()[0]);
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
               color: 'white'
             }}>
          <div style={{color: 'red'}}>
            {
              props.data.name
            }
          </div>
          {
            <>
              <video
                id={props.data.userId + '-video'}
                width={640}
                height={320}
                autoPlay ref={videoRef} muted
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
              {
                !props.isCurrentUser &&
                <audio autoPlay muted={audioMuted} ref={audioRef} id={props.data.userId + '-audio'}/>
              }
            </>
          }
        </div>
      }
    </>
  )
};

export default MeetingParticipant;
