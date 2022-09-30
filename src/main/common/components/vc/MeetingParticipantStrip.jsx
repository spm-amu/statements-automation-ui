/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import './MeetingParticipantStrip.css';

const MeetingParticipant = (props) => {
	const videoRef = useRef();

	useEffect(() => {
		// on receiving remote user's stream attach it to this video element using ref
		//props.peer.on("stream", (stream) => {
		//	videoRef.current.srcObject = stream;
		//});
	}, []);

	return (
      <div>
        <div>
          {
            props.data.name
          }
        </div>
        {
          props.data.showVideo ?
            <video controls playsInline autoPlay ref={videoRef} />
            :
            <img src={props.data.avatar} />
        }
      </div>
    )

};

export default MeetingParticipant;
