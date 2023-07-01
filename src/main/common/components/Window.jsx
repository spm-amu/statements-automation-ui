import React, {useEffect, useState} from 'react';
import "./Window.css"
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import Icon from "./Icon";
import IconButton from "@material-ui/core/IconButton";

const StyledDialog = withStyles({
  root: {pointerEvents: "none"},
  paper: {
    pointerEvents: 'auto',
    width: '100%',
    height: '100%',
    maxWidth: 'calc(100% - 144px)',
    maxHeight: 'calc(100% - 48px)',
    margin: '48px 0 0 144px',
    overflow: 'hidden',
    borderRadius: 0,
    boxShadow: 'none !important',
    ['@media (max-width:991px)']: {
      margin: '54px 0 0 0',
      maxWidth: '100%'
    }
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

const Window = (props) => {

  const {children, open, minimizable} = props;
  const [displayState, setDisplayState] = useState(props.displayState);
  const [windowTransformValue, setWindowTransformValue] = useState(null);

  useEffect(() => {
    if (displayState) {
      setDisplayState(props.displayState);
    }
  }, [props.displayState]);

  useEffect(() => {
    if (displayState === 'MAXIMIZED') {
      maximizeView(null)
    } else {
      minimizeView(null)
    }
  }, [displayState]);


  const minimizeView = (e) => {
    if (minimizable) {
      let paper = document.getElementById('meetingDialogPaper');

      if (paper) {
        paper.parentElement.style.display = 'flex';
        paper.parentElement.style.alignItems = 'flex-end';
        paper.parentElement.style.justifyContent = 'flex-end';

        if (windowTransformValue) {
          paper.style.transform = windowTransformValue;
        }

        paper.style.color = '#FFFFFF';
        paper.style.backgroundColor = '#000000';
        paper.style.width = '700px';
        paper.style.height = '400px';
        paper.style.margin = '0 16px 16px 16px';

        let header = document.getElementsByClassName('dialogHeader')[0];
        header.getElementsByTagName('button')[0].style.color = '#FFFFFF';
        document.getElementById('meeting-window-title').style.cursor = 'move';
        setDisplayState('MINIMIZED');
        props.onDisplayModeChange('MINIMIZED');
      }
    }
  };

  const maximizeView = (e) => {
    let paper = document.getElementById('meetingDialogPaper');

    if (paper) {
      let sidebar = document.getElementsByClassName('sidebar')[0];
      let sidebarTransform = window.getComputedStyle(sidebar, null).transform;
      let isSidebarHidden = sidebarTransform && sidebarTransform.includes('-144');

      setWindowTransformValue(paper.style.transform);
      paper.style.transform = 'translate(0, 0)';

      paper.style.color = '#1d253b';
      paper.style.backgroundColor = '#FFFFFF';
      paper.style.width = '100%';
      paper.style.height = '100%';
      paper.style.margin = isSidebarHidden ? '54px 0 0 0' : '54px 0 0 144px';

      let header = document.getElementsByClassName('dialogHeader')[0];
      header.getElementsByTagName('button')[0].style.color = 'rgba(0, 0, 0, 0.54)';
      document.getElementById('meeting-window-title').style.cursor = 'default';
      setDisplayState('MAXIMIZED');
      props.onDisplayModeChange('MAXIMIZED');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      maxHeight: '100%',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'none',
      backgroundColor: '#000000'
    }}>
      <StyledDialog
        disableEnforceFocus
        open={open}
        onClose={(e) => {
        }}
        keepMounted
        hideBackdrop={true}
        aria-labelledby="meeting-window-title"
        aria-describedby="meeting-window-description"
        className={props.containerClassName}
        PaperComponent={PaperComponent}
        PaperProps={{id: 'meetingDialogPaper', disabled: displayState === 'MAXIMIZED'}}
      >
        <div className={"meeting-window-header"}>
          <div id="meeting-window-title">
            {
              minimizable &&
              <div>
                <div className={'dialogHeader row'}>
                  <div className={'meeting-title col'}>
                    {
                      props.toolbarDisplayState === 'VISIBLE' &&
                      props.toolbar
                    }
                  </div>
                  <div>
                    {
                      displayState === 'MAXIMIZED' ?
                        <IconButton
                          onClick={(e) => {
                            minimizeView(e)
                          }}
                          style={{
                            marginRight: '4px'
                          }}
                        >
                          <Icon id={'MINIMIZE'} color={'white'}/>
                        </IconButton>
                        :
                        <IconButton
                          onClick={(e) => {
                            maximizeView(e)
                          }}
                          style={{
                            marginRight: '4px',
                            color: 'white'
                          }}
                        >
                          <Icon id={'MAXIMIZE'}/>
                        </IconButton>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
        {
          children
        }
      </StyledDialog>
    </div>
  );
};

export default Window;
