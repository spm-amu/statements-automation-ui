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
import Camera from '@material-ui/icons/Videocam';
import AttachFile from '@material-ui/icons/AttachFile';
import CameraOff from '@material-ui/icons/VideocamOff';
import Microphone from '@material-ui/icons/Mic';
import MicrophoneOff from '@material-ui/icons/MicOff';
import Minimize from '@material-ui/icons/Minimize';
import Maximize from '@material-ui/icons/Maximize';
import Work from '@material-ui/icons/Work';
import PanTool from '@material-ui/icons/PanTool';
import List from '@material-ui/icons/List';
import Calendar from '@material-ui/icons/CalendarTodayTwoTone';
import Person from '@material-ui/icons/Person';
import Folder from '@material-ui/icons/Folder';
import Help from '@material-ui/icons/Help';
import Close from '@material-ui/icons/Close';
import Link from "@material-ui/icons/Link";
import React, {Component} from "react";
import {
  CallMissed,
  Notifications,
  Call,
  CallEnd,
  CancelPresentation,
  ChatBubbleOutline,
  Done,
  People,
  PresentToAll,
  Reply,
  Videocam,
  VideocamOff,
  History,
  Warning
} from '@material-ui/icons';

class Icon extends Component {

  constructor() {
    super();
  }

  render() {
    if (this.props.id === 'ADD') {
      return <AddIcon/>
    } else if (this.props.id === 'EDIT') {
      return <EditIcon/>
    } else if (this.props.id === 'NOTIFICATIONS') {
      return <Notifications/>
    } else if (this.props.id === 'REPLY') {
      return <Reply/>
    } else if (this.props.id === 'CLOSE') {
      return <Close/>
    } else if (this.props.id === 'MINIMIZE') {
      return <Minimize/>
    } else if (this.props.id === 'MAXIMIZE') {
      return <Maximize/>
    } else if (this.props.id === 'DONE') {
      return <Done/>
    } else if (this.props.id === 'REMOVE') {
      return <RemoveIcon/>
    } else if (this.props.id === 'SAVE') {
      return <SaveIcon/>
    } else if (this.props.id === 'INFO') {
      return <InfoIcon/>
    } else if (this.props.id === 'WARNING') {
      return <Warning/>
    } else if (this.props.id === 'DELETE') {
      return <DeleteIcon/>
    } else if (this.props.id === 'DOWNLOAD') {
      return <Download/>
    } else if (this.props.id === 'LINK') {
      return <Link/>
    } else if (this.props.id === 'HELP') {
      return <Help/>
    } else if (this.props.id === 'CALENDAR') {
      return <Calendar {...this.props}/>
    } else if (this.props.id === 'CHATS') {
      return <img src={require('/assets/icons/menu/chats.svg')} width={'27px'} alt={''}/>
    } else if (this.props.id === 'FILES') {
      return <img src={require('/assets/icons/menu/files.svg')} width={'27px'} alt={''}/>
    } else if (this.props.id === 'MEETINGS') {
      return <img src={require('/assets/icons/menu/meetings.svg')} width={'27px'} alt={''}/>
    } else if (this.props.id === 'SEARCH') {
      return <SearchIcon/>
    } else if (this.props.id === 'WORK') {
      return <Work/>
    } else if (this.props.id === 'ATTACH_FILE') {
      return <AttachFile/>
    } else if (this.props.id === 'NOTIFICATIONS') {
      return <Notifications/>
    } else if (this.props.id === 'HOME') {
      return <img src={require('/assets/armscor_logo.png')} height={'35px'} alt={''}/>
    } else if (this.props.id === 'LIST') {
      return <List/>
    } else if (this.props.id === 'MIC') {
      return <Microphone {...this.props}/>
    } else if (this.props.id === 'MIC_OFF') {
      return <MicrophoneOff/>
    } else if (this.props.id === 'CAMERA') {
      return <Camera/>
    } else if (this.props.id === 'CAMERA_OFF') {
      return <CameraOff/>
    } else if (this.props.id === 'VIDEOCAM_OFF') {
      return <VideocamOff/>
    } else if (this.props.id === 'VIDEOCAM') {
      return <Videocam/>
    } else if (this.props.id === 'CANCEL_PRESENTATION') {
      return <CancelPresentation/>
    } else if (this.props.id === 'PRESENT_TO_ALL') {
      return <PresentToAll/>
    } else if (this.props.id === 'CHAT_BUBBLE') {
      return <ChatBubbleOutline {...this.props}  />
    } else if (this.props.id === 'CALL') {
      return <Call/>
    } else if (this.props.id === 'CALL_END') {
      return <CallEnd/>
    } else if (this.props.id === 'CALL_MISSED') {
      return <CallMissed/>
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
      return <Folder/>
    } else if (this.props.id === 'HISTORY') {
      return <History/>
    } else if (this.props.id === 'SIGN') {
      return <i className="fas fa-pen-nib" style={{color: this.props.color}}/>
    } else if (this.props.id === 'ERROR') {
      return <ErrorIcon style={{color: '#f44336'}}/>
    }

    return null;
  };
}

export default Icon;
