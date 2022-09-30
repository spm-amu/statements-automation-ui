/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useRef, forwardRef} from "react";
import './MeetingParticipant.css'

const MeetingParticipant = forwardRef((props, ref) => {
  const videoRef = ref ? ref : useRef();
  const showVideo = true;

  useEffect(() => {
    if(!ref) {
      //props.data.peer.on("stream", (stream) => {
      //  videoRef.current.srcObject = stream;
      //});
    }
  }, []);

  return (
    <div className={'col-*-* meeting-participant-container'} style={props.showName ? {padding: '4px 4px 4px 12px'} : null}>
      <div style={{width: '100%', height: props.showName ? 'calc(100% - 48px)' : '100%'}}>
        {
          showVideo ?
            <div style={{width: '100%', height: '100%', backgroundColor: '#aaaaaa'}}>
              <video playsInline autoPlay ref={videoRef}
                     style={{width: '100%', height: '100%'}}/>
            </div>
            :
            <div
              style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img src={props.data.avatar}
                   style={{width: '280px', height: '280px', borderRadius: '50%', backgroundColor: '#FFFFFF'}}/>
            </div>
        }
      </div>
      {
        props.showName &&
        <div className={'name-label'}>
          {
            props.data.name
          }
        </div>

      }
    </div>
  )

});

export default MeetingParticipant;
