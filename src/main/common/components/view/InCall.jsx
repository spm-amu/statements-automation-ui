import React, {useState} from 'react';
import './InCall.css'
import InCallCard from '../vc/InCallCard';

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {participants} = props;

  return (
    <div className={'w-100 h-100 people-container'}>
      {
        participants.length > 0 &&
        <div className={'people-content row'} style={{height: '100%', overflow: 'none'}}>
          <h3 className={'header-panel'} style={{height: '32px'}}>In call</h3>
          <div className={'people-content-list'} style={{height: 'calc(100% - 48px)', width: '100%', overflow: 'auto'}}>
            {participants.map((participant, index) => {
              return <InCallCard
                key={index}
                onChangeMeetingHostHandler={(e) => props.onChangeMeetingHostHandler(e)}
                onPinHandler={(participant, pinned) => props.onPinHandler(participant, pinned)}
                onBringToViewHandler={(participant) => props.onBringToViewHandler(participant)}
                onHostVideoMute={(participant) => props.onHostVideoMute(participant)}
                onHostAudioMute={(participant) => props.onHostAudioMute(participant)}
                isHost={props.isHost}
                participant={participant}
              />
            })}
          </div>
        </div>
      }
    </div>
  );
};


export default InCall;
