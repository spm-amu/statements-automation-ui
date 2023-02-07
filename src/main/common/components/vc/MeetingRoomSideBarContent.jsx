import React, {useState} from "react";
import Button from '../RegularButton';
import styles from "../view/security/LoginStyle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import withStyles from "@material-ui/core/styles/withStyles";
import Draggable from "react-draggable";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import People from "../view/People";
import "./MeetingRoomSideBarContent.css"
import InCall from '../view/InCall';
import ChatRoom from '../chat/ChatRoom';

const StyledDialog = withStyles({
  root: {pointerEvents: "none"},
  paper: {
    pointerEvents: 'auto',
    width: '50%',
    height: '50%',
    minWidth: '400px',
    padding: '0',
    overflow: 'hidden'
  }
})(props => <Dialog hideBackdrop {...props} />);

const PaperComponent = (props) => (
  <Draggable
    disabled={props.disabled}
    handle="#meeting-window-title"
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

const MeetingRoomSideBarContent = (props) => {
  const [peopleDialogOpen, setPeopleDialogOpen] = useState(false);
  const {
    tab,
    isHost,
    meetingId,
    participants,
    participantsRaisedHands,
    meetingChat
  } = props;

  React.useEffect(() => {
  }, []);

  return (
    <div className={'meeting-room-sb-container'}
    >
      <StyledDialog
        open={peopleDialogOpen}
        onClose={(e) => {
        }}
        keepMounted
        aria-labelledby="people-window-title"
        aria-describedby="people-window-description"
        PaperComponent={PaperComponent}
        PaperProps={{id: 'peopleSearchDialogPaper'}}
      >
        <DialogTitle id="people-window-title">
          <div className={'closable-panel-header row'}>
            <div className={'title col'}>
              Request to join
            </div>
            <div style={{width: '64px'}}>
              <IconButton
                style={{
                  marginRight: '4px'
                }}
                onClick={(e) => {
                  setPeopleDialogOpen(false)
                }}
              >
                <Icon id={'CLOSE'}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <div style={{height: '100%'}} className={'request-to-join-dialog-content'}>
            <People meetingId={meetingId} dialEnabled={true} chatEnabled={false}
                    onAudioCallHandler={(e) => props.onAudioCallHandler(e)}/>
          </div>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </StyledDialog>
      <div className={'raised-hands'}>

      </div>
      {
        tab === 'People' &&
        <div className={'toolbar'}>
          <Button
            onClick={(e) => {
              setPeopleDialogOpen(true)
            }}
            variant="contained"
            color="primary"
            fullWidth={true}
            style={styles.loginBtn}
          >
            Request to join
          </Button>
        </div>
      }
      <div className={'list'}>
        {
          tab === 'People' ?
            <InCall
              onChangeMeetingHostHandler={(e) => props.onChangeMeetingHostHandler(e)}
              isHost={isHost}
              participants={participants}
              participantsRaisedHands={participantsRaisedHands}
            /> :
            <ChatRoom chatTab={true} selectedChat={meetingChat} meetingId={meetingId}/>
        }
      </div>
    </div>
  );
};

export default MeetingRoomSideBarContent;
