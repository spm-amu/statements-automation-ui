/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './MeetingParticipant.css'
import Utils from '../../../Utils';
import {MessageType, SystemEventType} from "../../../types";
import appManager from "../../../../common/service/AppManager";
import socketManager from "../../../../common/service/SocketManager";
import mediaSoupHelper from "./MediaSoupHelper";
import {Buffer} from "buffer/";

const VIDEO_CONSTRAINTS = {
  mandatory: {
    width: {min: 160, ideal: 320, max: 640},
    height: {min: 120, ideal: 240, max: 480},
    frameRate: {
      min: 15,
      max: 15
    },
    googCpuOveruseDetection: true,
    googCpuOveruseEncodeUsage: true,
    googCpuOveruseThreshold: 70
  }
};

const MeetingParticipant = (props) => {
  const [handRaised, setHandRaised] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = React.useState(props.audioMuted);
  const [producers] = React.useState(new Map());
  const [soundLevel, setSoundLevel] = React.useState(0);
  const [device, setDevice] = React.useState(null);
  const [consumerTransport, setConsumerTransport] = React.useState(null);
  const [producerTransport, setProducerTransport] = React.useState(null);
  const [eventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const videoRef = useRef();
  const soundLevelCounter = useRef(0);
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
      videoRef.current.srcObject = props.data.stream;
    }
  }, [soundLevel]);

  useEffect(() => {
    if (audioMuted) {
      setSoundLevel(0);
      if (props.soundMonitor && !props.inView) {
        props.soundMonitor(props.data.userId, true);
      }

      stopProducing('audio');
    } else {
      if(device) {
        produce('audio');
      }
    }
  }, [audioMuted]);

  const onAVSettingsChange = (payload) => {
    if (props.data.userId === payload.userId) {
      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);
    }
  };

  useEffect(() => {
  }, [props.data]);

  useEffect(() => {
    if (videoMuted) {
      stopProducing('video');
    } else {
      if(device) {
        produce('video');
      }
    }
  }, [videoMuted]);

  useEffect(() => {
    if(producerTransport) {
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

  const setupDevice = async () => {
    let participantDevice = await mediaSoupHelper.getParticipantDevice(props.rtpCapabilities);
    setDevice(participantDevice);
    setConsumerTransport(await mediaSoupHelper.initConsumerTransport(participantDevice, props.meetingId, props.data.userId));
    if(props.isCurrentUser) {
      setProducerTransport(await mediaSoupHelper.initProducerTransport(participantDevice, props.meetingId, props.data.userId));
    }
  };

  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);

    setupDevice();

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const produce = async (type) => {
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
          video: VIDEO_CONSTRAINTS
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
    producers.set(type, producer);

    videoRef.current.srcObject = stream;
    producer.on('transportclose', () => {
      videoRef.current.srcObject.getTracks().forEach(function (track) {
        track.stop()
      });

      videoRef.current.parentNode.removeChild(elem);
      this.producers.delete(type)
    });

    producer.on('close', () => {
      videoRef.current.srcObject.getTracks().forEach(function (track) {
        track.stop()
      });

      this.producers.delete(type)
    });
  };

  const stopProducing = (type) => {
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
             style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null, color: 'white'}}>
          {
            !videoMuted ?
              <video
                id={props.data.userId}
                width={640}
                height={320}
                autoPlay muted={audioMuted} ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
              :
              audioMuted ?
                <audio autoPlay muted ref={videoRef}/>
                :
                <audio autoPlay ref={videoRef}/>
          }
        </div>
      }
    </>
  )
};

export default MeetingParticipant;
