/* eslint-disable react-hooks/exhaustive-deps */
import {forwardRef, useEffect, useRef} from "react";
import './MeetingParticipant.css'
import Utils from '../../Utils';

const MeetingParticipant = forwardRef((props, ref) => {
  const videoRef = ref ? ref : useRef();
  const showVideo = true;

  useEffect(() => {
    if (props.data.peer) {
      videoRef.current.srcObject = props.data.stream;
    }
  }, []);

  useEffect(() => {
    if (props.refChangeHandler) {
      props.refChangeHandler(videoRef);
    }
  }, [videoRef.current]);

  return (
    <div className={'col-*-* meeting-participant-container'}
         style={{padding: props.padding ? props.padding : null, height: props.height ? props.height : null}}>
      <div style={{width: '100%', height: '100%'}}>
        {
          showVideo ?
            <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
              {
                props.videoMuted && !props.screenShared &&
                <div className={'centered-flex-box'} style={{width: '100%', height: '100%'}}>
                  <div className={'avatar'} data-label={Utils.getInitials(props.data.name)}
                       style={
                         {
                           width: props.sizing === 'sm' ? '64px' : null,
                           height: props.sizing === 'sm' ? '64px' : null,
                           fontSize: props.sizing === 'sm' ? '14px' : null
                         }
                       }/>
                </div>
              }
              {
                props.audioMuted || props.data.peer === null ?
                  <video
                    hidden={props.videoMuted && !props.screenShared}
                    muted playsInline autoPlay ref={videoRef}
                    style={{width: '100%', height: '100%'}}
                  />
                  :
                  <video
                    hidden={props.videoMuted && !props.screenShared}
                    playsInline autoPlay ref={videoRef}
                    style={{width: '100%', height: '100%'}}
                  />
              }
              <div className={props.sizing === 'sm' ? 'name-label-sm' : 'name-label'}> {props.showName ? props.data.name : 'You'}</div>
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
                       style={{width: props.sizing === 'sm' ? '40px' : '80px', height: props.sizing === 'sm' ? '40px' : '80px', borderRadius: '50%', backgroundColor: '#FFFFFF'}}/>
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

});

export default MeetingParticipant;
