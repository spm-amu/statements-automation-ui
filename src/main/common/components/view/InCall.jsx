import React, {useEffect, useState} from 'react';
import './InCall.css'
import { IconButton, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import { Call, Chat, MoreHoriz } from '@material-ui/icons';
import Icon from '../Icon';
import InCallCard from '../vc/InCallCard';

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { participantsRaisedHands, participants } = props;

  useEffect(() => {
    console.log('IN CALL participantsRaisedHands: ', participantsRaisedHands);
    console.log('IN CALL participants: ', participants);
  }, [participantsRaisedHands]);

  return (
    <div className={'w-100 h-100 people-container'}>
      {
        participants.length > 0 &&
        <div className={'people-content row'}>
          <h3 className={'header-panel'}>In call</h3>
          {participants.map((participant, index) => {
            return <InCallCard key={index} isHost={props.isHost} participant={participant} raisedHands={participantsRaisedHands.filter((p) => p.userId === participant.userId).length > 0}/>
          })}
        </div>
      }
    </div>
  );
};


export default InCall;
