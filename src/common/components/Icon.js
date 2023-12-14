import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import ErrorIcon from '@material-ui/icons/Error';
import Download from '@material-ui/icons/CloudDownload';
import Upload from '@material-ui/icons/CloudUpload';
import RotateLeft from '@material-ui/icons/RotateLeft';
import RotateRight from '@material-ui/icons/RotateRight';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import Check from '@material-ui/icons/Check';
import Camera from '@material-ui/icons/Videocam';
import AttachFile from '@material-ui/icons/AttachFile';
import CameraOff from '@material-ui/icons/VideocamOff';
import Microphone from '@material-ui/icons/Mic';
import MicrophoneOff from '@material-ui/icons/MicOff';
import Minimize from '@material-ui/icons/Minimize';
import Launch from '@material-ui/icons/Launch';
import Work from '@material-ui/icons/Work';
import PanTool from '@material-ui/icons/PanTool';
import List from '@material-ui/icons/List';
import Calendar from '@material-ui/icons/CalendarTodayTwoTone';
import Person from '@material-ui/icons/Person';
import Folder from '@material-ui/icons/Folder';
import Help from '@material-ui/icons/Help';
import Close from '@material-ui/icons/Close';
import Link from "@material-ui/icons/Link";
import DownArrow from "@material-ui/icons/ArrowDownward";
import React, {Component} from "react";
import {
  MeetingRoom,
  Call,
  CallEnd,
  CallMissed,
  CallReceived,
  Cancel,
  CancelPresentation,
  ChatBubbleOutline,
  Done,
  FiberManualRecord,
  History,
  Notifications,
  People,
  PresentToAll,
  Reply,
  Videocam,
  VideocamOff,
  Warning,
  TextFields,
  PlayArrow,
  Stop,
  Note, MoreHoriz, PersonAdd, Poll
} from '@material-ui/icons';


class Icon extends Component {

  constructor() {
    super();
  }

  render() {
    if (this.props.id === 'ADD') {
      return <AddIcon style={{color: this.props.color}}/>
    } else if (this.props.id === 'EDIT') {
      return <EditIcon/>
    } else if (this.props.id === 'RECORD') {
      return <FiberManualRecord/>
    } else if (this.props.id === 'NOTIFICATIONS') {
      return <Notifications/>
    } else if (this.props.id === 'CANCEL') {
      return <Cancel/>
    } else if (this.props.id === 'REPLY') {
      return <Reply/>
    } else if (this.props.id === 'CLOSE') {
      return <Close style={{color: this.props.color}}/>
    } else if (this.props.id === 'CHECK') {
      return <Check style={{color: this.props.color}}/>
    } else if (this.props.id === 'MINIMIZE') {
      return <Minimize style={{color: this.props.color}}/>
    } else if (this.props.id === 'MAXIMIZE') {
      return <Launch style={{color: this.props.color}}/>
    } else if (this.props.id === 'DONE') {
      return <Done/>
    } else if (this.props.id === 'REMOVE') {
      return <RemoveIcon/>
    } else if (this.props.id === 'SAVE') {
      return <SaveIcon/>
    } else if (this.props.id === 'INFO') {
      return <InfoIcon/>
    } else if (this.props.id === 'WARNING') {
      return <Warning style={{color: this.props.color}}/>
    } else if (this.props.id === 'DELETE') {
      return <DeleteIcon/>
    } else if (this.props.id === 'DOWNLOAD') {
      return <Download/>
    } else if (this.props.id === 'LINK') {
      return <Link style={{color: this.props.color}}/>
    } else if (this.props.id === 'POLL') {
      return <Poll/>
    } else if (this.props.id === 'HELP') {
      return <Help/>
    } else if (this.props.id === 'CALENDAR') {
      return <Calendar {...this.props}/>
    } else if (this.props.id === 'SEARCH') {
      return <SearchIcon/>
    } else if (this.props.id === 'WORK') {
      return <Work/>
    } else if (this.props.id === 'ATTACH_FILE') {
      return <AttachFile style={{fontSize: '24px', color: this.props.color}}/>
    } else if (this.props.id === 'NOTIFICATIONS') {
      return <Notifications/>
    } else if (this.props.id === 'LIST') {
      return <List/>
    } else if (this.props.id === 'MIC') {
      return <Microphone {...this.props} style={{color: this.props.color}}/>
    } else if (this.props.id === 'MIC_OFF') {
      return <MicrophoneOff style={{color: this.props.color}}/>
    } else if (this.props.id === 'CAMERA') {
      return <Camera style={{color: this.props.color}}/>
    } else if (this.props.id === 'CAMERA_OFF') {
      return <CameraOff style={{color: this.props.color}}/>
    } else if (this.props.id === 'VIDEOCAM_OFF') {
      return <VideocamOff style={{color: this.props.color}}/>
    } else if (this.props.id === 'VIDEOCAM') {
      return <Videocam style={{color: this.props.color}}/>
    } else if (this.props.id === 'CANCEL_PRESENTATION') {
      return <CancelPresentation/>
    } else if (this.props.id === 'PRESENT_TO_ALL') {
      return <PresentToAll/>
    } else if (this.props.id === 'CHAT_BUBBLE') {
      return <ChatBubbleOutline {...this.props} style={{color: this.props.color}}/>
    } else if (this.props.id === 'CALL') {
      return <Call/>
    } else if (this.props.id === 'CALL_END') {
      return <CallEnd/>
    } else if (this.props.id === 'CALL_MISSED') {
      return <CallMissed/>
    } else if (this.props.id === 'CALL_RECEIVED') {
      return <CallReceived/>
    } else if (this.props.id === 'MEETING_ROOM') {
      return <MeetingRoom/>
    } else if (this.props.id === 'PEOPLE') {
      return <People/>
    } else if (this.props.id === 'UPLOAD') {
      return <Upload/>
    } else if (this.props.id === 'ROTATE_LEFT') {
      return <RotateLeft/>
    } else if (this.props.id === 'ROTATE_RIGHT') {
      return <RotateRight/>
    } else if (this.props.id === 'ZOOM_IN') {
      return <ZoomIn/>
    } else if (this.props.id === 'PAN_TOOL') {
      return <PanTool/>
    } else if (this.props.id === 'ZOOM_OUT') {
      return <ZoomOut/>
    } else if (this.props.id === 'PANTOOL') {
      return <PanTool {...this.props}/>
    } else if (this.props.id === 'PERSON') {
      return <Person/>
    } else if (this.props.id === 'INITIAL') {
      return <i className="fas fa-signature" style={{color: this.props.color}}/>
    } else if (this.props.id === 'FOLDER') {
      return <Folder style={{color: this.props.color}}/>
    } else if (this.props.id === 'HISTORY') {
      return <History/>
    } else if (this.props.id === 'MORE') {
      return <MoreHoriz style={{color: this.props.color}}/>
    } else if (this.props.id === 'NOTE') {
      return <Note/>
    } else if (this.props.id === 'PLAY') {
      return <PlayArrow/>
    } else if (this.props.id === 'STOP') {
      return <Stop/>
    } else if (this.props.id === 'CHEVRON_DOWN') {
      return <i className="fas fa-chevron-down" style={{color: this.props.color}}/>
    } else if (this.props.id === 'TEXT_FIELDS') {
      return <TextFields/>
    } else if (this.props.id === 'PERSON_ADD') {
      return <PersonAdd/>
    } else if (this.props.id === 'SIGN') {
      return <i className="fas fa-pen-nib" style={{color: this.props.color}}/>
    } else if (this.props.id === 'ERROR') {
      return <ErrorIcon style={{color: '#f44336'}}/>
    }

    return null;
  };
}

export default Icon;
