/* eslint-disable react-hooks/exhaustive-deps */
import {forwardRef, useEffect, useRef} from "react";
import './MeetingParticipant.css'
import Utils from '../../Utils';

const MeetingParticipant = forwardRef((props, ref) => {
  const videoRef = ref ? ref : useRef();
  const showVideo = true;

  useEffect(() => {
    if (props.data.peer) {
      props.data.peer.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
      });
    }
  }, []);

  return (
    <div className={'col-*-* meeting-participant-container'}
         style={props.showName ? {padding: props.padding ? props.padding : '4px 4px 12px 12px'} : null}>
      <div style={{width: '100%', height: '100%'}}>
        {
          showVideo ?
            <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
              {
                props.videoMuted &&
                <div className={'centered-flex-box'} style={{width: '100%', height: '100%'}}>
                  <div className={'avatar'} data-label={Utils.getInitials(props.data.name)} />
                </div>
              }
              {
                props.audioMuted || props.data.peer === null ?
                  <video
                    hidden={props.videoMuted}
                    muted playsInline autoPlay ref={videoRef}
                    style={{width: '100%', minHeight: '200px', maxHeight: 'calc(100vh - 500px)'}}
                  />
                  :
                  <video
                    hidden={props.videoMuted}
                    playsInline autoPlay ref={videoRef}
                    style={{width: '100%', minHeight: '200px', maxHeight: 'calc(100vh - 500px)'}}
                  />
              }
              <div className={'name-label'}> {props.showName ? props.data.name : 'You'}</div>
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
                       style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFFFFF'}}/>
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
