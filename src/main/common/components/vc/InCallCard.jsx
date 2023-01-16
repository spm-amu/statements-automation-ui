import React, {useEffect, useState} from 'react';
import './InCallCard.css';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import Icon from '../Icon';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import { Autorenew, Note, PersonAdd, Settings } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreActions = Boolean(anchorEl);
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
      style={{marginLeft: '0', paddingLeft: '0', paddingRight: '0', maxWidth: props.maxWidth ? props.maxWidth : '400px',
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
            <div>
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

              {
                props.isHost &&
                <Tooltip title="More Actions">
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={openMoreActions ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMoreActions ? 'true' : undefined}
                  >
                    <Icon id={'MORE'}/>
                  </IconButton>
                </Tooltip>
              }

            </div>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openMoreActions}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiList-root': {
                    border: '1px solid red',
                  },
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'primary',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 20, vertical: 44 }}
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >

              <MenuItem >
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                Change Meeting Host
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InCall;
