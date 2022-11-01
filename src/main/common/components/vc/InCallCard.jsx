import React, { useEffect, useState } from 'react';
import './InCallCard.css';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import { Call, Chat, MoreHoriz, PanTool } from '@material-ui/icons';
import Icon from '../Icon';

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { participant, raisedHands } = props;

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
      style={{ marginLeft: '0', paddingLeft: '0', maxWidth: '400px' }}
    >
      <div className="participant-card">
        <div className="row no-margiperson-cardn">
          <div className={'avatar-small'}>
            <img
              src={
                participant.avatar
                  ? participant.avatar
                  : require('../../../desktop/dashboard/images/noimage-person.png')
              }
              alt={''}
              style={{ borderRadius: '50%' }}
            />
          </div>
          <div className={'user-details'}>{participant.name}</div>

          {
            !raisedHands ?
              <div>
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <MoreHoriz />
                </IconButton>

                <IconButton
                  onClick={() => {}}
                >
                  <Icon id={'MIC'} />
                </IconButton>
              </div> :
              <div>
                <PanTool style={{ color: '#e2b030' }} />
              </div>
          }

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
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
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem>
              <ListItemIcon>
                <Call fontSize="small" />
              </ListItemIcon>
              Call
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <Chat fontSize="small" />
              </ListItemIcon>
              Message
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default InCall;
