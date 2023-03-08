/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from "react";
import './MeetingParticipant.css'
import Utils from '../../Utils';
import Icon from '../Icon';
import {PanTool} from '@material-ui/icons';
import IconButton from "@material-ui/core/IconButton";

const MeetingParticipant = (props) => {
  const [handRaised, setHandRaised] = React.useState(false);

  const videoRef = useRef();
  const showVideo = true;

  useEffect(() => {
    if (props.data.peer) {
      videoRef.current.srcObject = props.data.stream;
    } else {
      videoRef.current.srcObject = props.userStream;
    }
  }, [props.data]);

  useEffect(() => {
    if (props.participantsRaisedHands) {
      let raisedHandParticipants = props.participantsRaisedHands.find((user => user.userId === props.data.userId));
      if (raisedHandParticipants) {
        setHandRaised(true);
      } else {
        setHandRaised(false);
      }
    }
  }, [props.participantsRaisedHands]);

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
  }

  return (
    <div className={'col-*-* meeting-participant-container'}
         style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null}}>
      <div style={{width: '100%', height: '100%'}}>
        {
          showVideo ?
            <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
              {
                props.videoMuted &&
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
                props.audioMuted || props.data.peer === null ?
                  <video
                    hidden={props.videoMuted}
                    muted playsInline autoPlay ref={videoRef}
                    style={{width: '100%', height: '100%'}}
                  />
                  :
                  <video
                    hidden={props.videoMuted}
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
                      props.isHost && !props.audioMuted ?
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
                          <Icon id={'MIC'} />
                        </IconButton>
                        :
                        <>
                          {props.audioMuted ? (
                            <Icon id={'MIC_OFF'}/>
                          ) : (
                            <Icon id={'MIC'}/>
                          )}
                        </>
                    }
                    {
                      props.isHost && !props.videoMuted &&
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
                          <Icon id={'CAMERA'} />
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
