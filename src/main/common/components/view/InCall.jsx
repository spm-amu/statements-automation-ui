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
  }, []);

  return (
    <div className={'w-100 h-100 people-container'}>
      {
        participantsRaisedHands.length > 0 &&
        <div className={'people-content row'}>
          <h3 className={'header-panel'}>Raised hands</h3>
          {participantsRaisedHands.map((participant, index) => {
            return <InCallCard key={index} participant={participant} raisedHands={true} />
          })}
        </div>
      }

      {
        participants.length > 0 &&
        <div className={'people-content row'}>
          <h3 className={'header-panel'}>In call</h3>
          {participants.map((participant, index) => {
            return <InCallCard key={index} participant={participant}  />
          })}
        </div>
      }
    </div>
  );
};


export default InCall;
