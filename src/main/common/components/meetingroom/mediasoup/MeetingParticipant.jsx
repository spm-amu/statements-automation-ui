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
  const [transports, setTransports] = React.useState(null);
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

      produce('audio');
    }
  }, [audioMuted]);

  const onAVSettingsChange = (payload) => {
    alert(payload.audioMuted);
    if (props.data.userId === payload.userId) {
      setAudioMuted(payload.audioMuted);
      setVideoMuted(payload.videoMuted);
    }
  };

  useEffect(() => {
  }, [props.data]);

  useEffect(() => {
  }, [videoMuted]);

  useEffect(() => {
    appManager.removeSubscriptions(systemEventHandler);
    appManager.addSubscriptions(systemEventHandler, SystemEventType.AUDIO_VISUAL_SETTINGS_CHANGED);
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);

    let participantDevice = mediaSoupHelper.getParticipantDevice(props.rtpCapabilities);
    setDevice(participantDevice);
    setTransports(mediaSoupHelper.initTransports(participantDevice, props.meetingId, props.data.userId));

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const produce = async (type) => {
    if (!props.device) {
      console.error('No available device');
      return;
    }

    if (!props.device.canProduce('video') && type === 'video') {
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

    let stream = screen
      ? await navigator.mediaDevices.getDisplayMedia()
      : await navigator.mediaDevices.getUserMedia(mediaConstraints);
    console.log(navigator.mediaDevices.getSupportedConstraints());

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

    let producer = await this.producerTransport.produce(params);











    videoRef.current.srcObject = stream;
    producer.on('transportclose', () => {
      if (!audio) {
        elem.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });

        elem.parentNode.removeChild(elem)
      }

      this.producers.delete(producer.id)
    });

    producer.on('close', () => {
      if (!audio) {
        elem.srcObject.getTracks().forEach(function (track) {
          track.stop()
        });
        elem.parentNode.removeChild(elem)
      }
      this.producers.delete(producer.id)
    });
  };

  const stopProducing = (type) => {
    alert('STOP PRODUCE : ' + type);
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
             style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null}}>
          <video
            id={props.data.userId}
            width={640}
            height={320}
            autoPlay muted ref={videoRef}
            style={{
              width: '100%',
              height: props.videoHeight ? props.videoHeight : '100%'
            }}
          />
        </div>
      }
    </>
  )
};

export default MeetingParticipant;
