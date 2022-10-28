/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';

const {electron} = window;

const MessagePreview = (props) => {
  const [messenger, setMessenger] = useState(null);
  const [initials, setInitials] = useState('');
  const [counter, setCounter] = useState(7);

  useEffect(() => {
    electron.ipcRenderer.on('messageViewContent', args => {
      setMessenger(args.payload);
    });
  }, []);

  useEffect(() => {
    if (messenger) {
      setInitials(Utils.getInitials(messenger.message.participant.name));
    }
  }, [messenger]);

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 5000);
    } else {
      electron.ipcRenderer.sendMessage('hideMessagePreview', {});
    }
  }, [counter]);

  return (
    messenger &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div className={'centered-flex-box w-100'} style={{height: '72px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
        {messenger.message.content}
      </div>
      <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
        <div className={'avatar'} data-label={initials}/>
      </div>
      <div className={'centered-flex-box w-100'} style={{marginTop: '32px'}}>
        <IconButton
          onClick={() => {}}
          style={{
            backgroundColor: '#464775',
            color: 'white',
            marginRight: '4px'
          }}
        >
          <Icon id={'REPLY'}/>
        </IconButton>

        <h4>
          Reply
        </h4>
      </div>
    </div>
  );
};

export default MessagePreview;
