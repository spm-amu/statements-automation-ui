import React, {useEffect, useState} from 'react';
import './InCallCard.css';
import {IconButton, ListItemIcon, Menu, MenuItem} from '@material-ui/core';
import Icon from '../Icon';
import {PersonAdd} from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import {useNavigate} from 'react-router-dom';
import appManager from "../../service/AppManager";
import Utils from '../../Utils';
import {MessageType} from "../../types";
import socketManager from "../../service/SocketManager";

const InCall = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreActions = Boolean(anchorEl);
  const {participant} = props;
  const [handRaised, setHandRaised] = React.useState(false);
  const [eventHandler] = useState({});
  const navigate = useNavigate();

  const handler = () => {
    return {
      get id() {
        return 'in-call-card-' + participant.userId;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.RAISE_HAND:
            onRaiseHand(be.payload);
            break;
          case MessageType.LOWER_HAND:
            onLowerHand(be.payload);
            break;
        }
      }
    }
  };

  const onRaiseHand = (payload) => {
    if(participant && payload && payload.userId === participant.userId) {
      setHandRaised(true);
    }
  };

  const onLowerHand = (payload) => {
    if(participant && payload && payload.userId === participant.userId) {
      setHandRaised(false);
    }
  };

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    socketManager.addSubscriptions(eventHandler, MessageType.RAISE_HAND, MessageType.LOWER_HAND);

    return () => {
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const privateChatHandler = () => {
    navigate("/view/chats", {
      state: {
        meetingRoom: {
          privateChatUserId: participant.userId
        }
      }
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const computeParticipantName = () => {
    let name = participant.name;

    if (Utils.isNull(participant.userId)) {
      name = `${name} (Guest)`;
    }

    return name;
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
          <div className={'col user-details'}>{ computeParticipantName() }</div>
          <div style={{
            marginTop: '4px',
            marginLeft: '0',
            marginRight: '0',
            paddingLeft: '0',
            paddingRight: '0',
            textAlign: 'right'
          }}>
            <div>
              {
                appManager.getUserDetails().userId !== participant.userId &&
                <IconButton
                  onClick={privateChatHandler}
                  size="small"
                  sx={{ml: 2}}
                >
                  <Icon id={'CHAT_BUBBLE'} fontSize={'small'}/>
                </IconButton>
              }
              {
                appManager.getUserDetails().userId !== participant.userId && handRaised &&
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
                props.isHost && appManager.getUserDetails().userId !== participant.userId &&
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

              <MenuItem
                disabled={Utils.isNull(participant.userId)}
                onClick={() => props.onChangeMeetingHostHandler(participant)}
              >
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
