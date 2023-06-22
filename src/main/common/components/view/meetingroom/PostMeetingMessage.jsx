import React, {useEffect} from "react";
import Icon from "../../Icon";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';

const PostMeetingMessage = (props) => {

  useEffect(() => {
  }, []);

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div style={{
        color: 'white',
        fontSize: '24px',
        width: '100%',
        height: 'calc(100% - 64px)'
      }} className={'centered-flex-box'}>
        {'The ' + (props.isDirectCall ? 'call' : 'meeting') + ' has been ended' + (props.isDirectCall ? '' : ' by the host')}
      </div>
      <div style={{
        color: 'white',
        width: '100%',
        height: '64px'
      }} className={'centered-flex-box'}>
        <Tooltip title="Call">
          <IconButton
            onClick={() => {
              props.closeHandler();
            }}
            style={{
              backgroundColor: '#eb3f21',
              color: 'white',
              marginRight: '4px',
              marginBottom: '32px'
            }}
          >
            <Icon id={'CLOSE'}/>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default PostMeetingMessage;
