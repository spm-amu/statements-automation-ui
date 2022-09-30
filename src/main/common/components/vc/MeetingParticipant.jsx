/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useRef} from "react";
import './MeetingParticipant.css'

const MeetingParticipant = (props) => {
  const videoRef = useRef();
  const showVideo = true;

  useEffect(() => {
    console.log('MeetingParticipant props: ', props)

    props.data.peer.on("stream", (stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <div className={'col-*-* meeting-participant-container'}>
      <div style={{width: '100%', height: 'calc(100% - 32px)'}}>
        {
          showVideo ?
            <video controls playsInline autoPlay ref={videoRef}/>
            :
            <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img src={props.data.avatar} style={{width: '280px', height: '280px', borderRadius: '50%', backgroundColor: '#FFFFFF'}}/>
            </div>
        }
      </div>
      <div style={{width: '100%', height: '32px'}}>
        {
          props.data.name
        }
      </div>
    </div>
  )

};

export default MeetingParticipant;
