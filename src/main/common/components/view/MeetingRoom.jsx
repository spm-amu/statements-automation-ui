import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageType } from '../../types';

import './Calendar.css';
import './MeetingRoom.css';
import AlertDialog from '../AlertDialog';
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  GridList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@material-ui/core";

import PartnerVideo from '../PartnerVideo';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import MyToolTip from '../MyToolTip';
import Icon from '../Icon';
import Peer from 'simple-peer';
import MeetingParticipant from "../vc/MeetingParticipant";
import MeetingParticipantGrid from "../vc/MeetingParticipantGrid";

const MeetingRoom = (props) => {

  const [participants, setParticipants] = useState([
    {
      peer: null,
      name: 'Amukelani Shandli',
      avatar: require('../../../desktop/dashboard/images/noimage-person.png')
    },
    {
      peer: null,
      name: 'Nsovo Ngobz',
      avatar: require('../../../desktop/dashboard/images/noimage-person.png')
    },
    {
      peer: null,
      name: 'Peter Ngulz',
      avatar: require('../../../desktop/dashboard/images/noimage-person.png')
    },
    {
      peer: null,
      name: 'Peter Ngulz',
      avatar: require('../../../desktop/dashboard/images/noimage-person.png')
    },
    {
      peer: null,
      name: 'Peter Ngulz',
      avatar: require('../../../desktop/dashboard/images/noimage-person.png')
    }
  ]);

  return (
    <div className={'grid-container'}>
      <MeetingParticipantGrid participants={participants}/>
    </div>
  );
};

export default MeetingRoom;
