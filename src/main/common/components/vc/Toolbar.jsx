/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import './Toolbar.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from "../../Utils";
import Tooltip from '@material-ui/core/Tooltip';
import { ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import { Note, PersonAdd, Settings } from '@material-ui/icons';

const Toolbar = (props) => {
  const [videoMuted, setVideoMuted] = useState(props.videoMuted);
  const [audioMuted, setAudioMuted] = useState(props.audioMuted);
  const [isRecording, setIsRecording] = useState(false);
  const [autoPermit, setAutoPermit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreActions = Boolean(anchorEl);
  const [screenShared] = useState(false);

  const {
    displayState,
    eventHandler,
    handRaised,
    step,
    isHost
  } = props;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const muteVideo = () => {
    setVideoMuted((prevStatus) => !prevStatus);
  };

  const toggleRecorder = () => {
    setIsRecording((prevStatus) => !prevStatus);
  };

  useEffect(() => {
    if (!isRecording) {
      eventHandler.stopRecording(isRecording);
    } else {
      eventHandler.recordMeeting(isRecording)
    }
  }, [isRecording]);

  useEffect(() => {
    setAutoPermit(props.autoPermit);
  }, [props.autoPermit]);

  useEffect(() => {
    eventHandler.onMuteVideo(videoMuted);
  }, [videoMuted]);

  useEffect(() => {
    setVideoMuted(props.videoMuted);
  }, [props.videoMuted]);

  useEffect(() => {
    setAudioMuted(props.audioMuted);
  }, [props.audioMuted]);

  useEffect(() => {
    eventHandler.onMuteAudio(audioMuted);
  }, [audioMuted]);

  const muteAudio = () => {
    setAudioMuted((prevStatus) => !prevStatus);
  };

  const shareScreen = () => {
    eventHandler.shareScreen();
  };

  const stopShareScreen = () => {
    eventHandler.stopShareScreen();
  };

  const endCall = () => {
    eventHandler.endCall();
  };

  const showPeople = () => {
    eventHandler.showPeople()
  };

  const showWhiteboard = () => {
    eventHandler.showWhiteboard()
  };

  const showChat = () => {
    eventHandler.showChat()
  };

  const raiseHand = () => {
    eventHandler.raiseHand()
  };

  const lowerHand = () => {
    eventHandler.lowerHand()
  };

  const toggleAutoPermit = () => {
    setAutoPermit(prevAutoPermit => !prevAutoPermit);
    eventHandler.toggleAutoPermit()
  };

	return (
    <div className={'footer-toolbar'}>
      <div className={'row centered-flex-box'}>

        <IconButton
          onClick={() => {
            toggleRecorder();
          }}
          style={{
            backgroundColor: isRecording ? '#eb3f21' : '#404239',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'RECORD'}/>
        </IconButton>

        {!screenShared && (
          <IconButton
            onClick={() => {
                muteVideo();
            }}
            style={{
              backgroundColor: videoMuted ? "#eb3f21" : "#404239",
              color: 'white',
              marginRight: '4px'
            }}
          >
            {videoMuted ? (
              <Icon id={'VIDEOCAM_OFF'}/>
            ) : (
              <Icon id={'VIDEOCAM'}/>
            )}
          </IconButton>
        )}

        <IconButton
          onClick={() => {
              muteAudio();
          }}
          style={{
            backgroundColor: audioMuted ? "#eb3f21" : "#404239",
            color: 'white',
            marginRight: '4px'
          }}
        >
          {audioMuted ? (
            <Icon id={'MIC_OFF'}/>
          ) : (
            <Icon id={'MIC'}/>
          )}
        </IconButton>
        {" "}
        {
          step === 'SESSION' && displayState === 'MAXIMIZED' &&
          <IconButton
            onClick={() => {
              if (screenShared) {
                stopShareScreen();
              } else {
                shareScreen();
              }
            }}
            style={{
              backgroundColor: screenShared ? '#8eb2f5' : '#404239',
              color: 'white',
              marginRight: '4px'
            }}
          >
            {screenShared ? (
              <Icon id={'CANCEL_PRESENTATION'}/>
            ) : (
              <Icon id={'PRESENT_TO_ALL'}/>
            )}
          </IconButton>
        }
        {
          step === 'SESSION' && displayState === 'MAXIMIZED' &&
          <IconButton
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
            onClick={(e) => showChat()}
          >
            <Icon id={'CHAT_BUBBLE'}/>
          </IconButton>

        }
        <IconButton
          onClick={endCall}
          style={{
            backgroundColor: '#eb3f21',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'CALL_END'}/>
        </IconButton>
        {
          step === 'SESSION' && displayState === 'MAXIMIZED' &&
          <IconButton
            onClick={(e) => showPeople()}
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
          >
            <Icon id={'PEOPLE'}/>
          </IconButton>
        }

        <IconButton
          onClick={(e) => {
            if(handRaised) {
              lowerHand();
            } else {
              raiseHand();
            }
          }}
          style={{
            backgroundColor: '#404239',
            color: handRaised ? '#e2b030' : 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'PAN_TOOL'}/>
        </IconButton>
        {
          step === 'SESSION' && displayState === 'MAXIMIZED' && isHost &&
          <IconButton
            onClick={(e) => showWhiteboard()}
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
          >
            <Icon id={'NOTE'}/>
          </IconButton>
        }
        <Tooltip title="More Actions">
          <IconButton
            onClick={handleClick}
            sx={{ ml: 2 }}
            aria-controls={openMoreActions ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMoreActions ? 'true' : undefined}
            style={{
              backgroundColor: '#404239',
              color: 'white',
              marginRight: '4px'
            }}
          >
            <Icon id={'MORE'}/>
          </IconButton>
        </Tooltip>
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
        transformOrigin={{ horizontal: 20, vertical: 136 }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem disabled={!isHost} onClick={toggleAutoPermit}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          {
            autoPermit ? 'Do Not Auto Permit' : 'Auto Permit'
          }
        </MenuItem>
        <MenuItem
          disabled={true}
        >
          <ListItemIcon>
            <Note fontSize="small" />
          </ListItemIcon>
          Open Whiteboard
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Toolbar;
