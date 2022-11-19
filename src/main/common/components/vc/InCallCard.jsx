import React, {useEffect, useState} from 'react';
import './InCallCard.css';
import {IconButton} from '@material-ui/core';
import Icon from '../Icon';

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {participant, raisedHands} = props;

  useEffect(() => {
    console.log('IN CALL CARD participant: ', participant);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      className={'col person-card-wrapper'}
      style={{marginLeft: '0', paddingLeft: '0', maxWidth: props.maxWidth ? props.maxWidth : '400px',
        borderBottom: props.borderBottom ? props.borderBottom : '1px solid #e1e1e1'}}
    >
      <div className="participant-card">
        <div className="row no-margin person-card">
          <div className={'avatar-small'}>
            <img
              src={
                participant.avatar
                  ? participant.avatar
                  : require('../../../desktop/dashboard/images/noimage-person.png')
              }
              alt={''}
              style={{borderRadius: '50%'}}
            />
          </div>
          <div className={'col user-details'}>{participant.name}</div>
          <div style={{
            marginTop: '4px',
            marginLeft: '0',
            marginRight: '0',
            paddingLeft: '0',
            paddingRight: '0',
            textAlign: 'right'
          }}>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ml: 2}}
            >
              <Icon id={'CHAT_BUBBLE'} fontSize={'small'}/>
            </IconButton>
            <IconButton
              onClick={() => {
              }}
              size="small"
              sx={{ml: 2}}
            >
              <Icon id={'MIC'} fontSize={'small'}/>
            </IconButton>
            {
              raisedHands &&
              <IconButton
                onClick={() => {
                }}
                size="small"
                sx={{ml: 1}}
                style={{color: '#e2b030'}}
              >
                <Icon id={'PANTOOL'} fontSize={'small'}/>
              </IconButton>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default InCall;
