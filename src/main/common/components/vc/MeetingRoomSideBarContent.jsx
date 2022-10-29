import React, {useState} from "react";
import "./MeetingRoomSideBarContent.css"
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
import SearchBar from "../SearchBar";
import People from "../view/People";

const StyledDialog = withStyles({
  root: {pointerEvents: "none"},
  paper: {
    pointerEvents: 'auto',
    width: '40%',
    height: '40%',
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
    tab
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
              Search
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
          <div style={{height: '100%'}}>
            <People chatEnabled={false} onAudioCallHandler={(e) => alert('Dial fireeee')}/>
          </div>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </StyledDialog>
      <div className={'raised-hands'}>

      </div>
      <div className={'toolbar'}>
        {
          tab === 'People' &&
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
        }
      </div>
      <div className={'list'}>
      </div>
    </div>
  );
};

export default MeetingRoomSideBarContent;
