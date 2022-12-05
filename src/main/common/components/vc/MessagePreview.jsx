/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './DialingPreview.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
import Button from '../RegularButton';

const {electron} = window;

const MessagePreview = (props) => {
  const [messenger, setMessenger] = useState(null);
  const [initials, setInitials] = useState('');
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    electron.ipcRenderer.on('messageViewContent', args => {
      setMessenger(args.payload);
    });
  }, []);

  useEffect(() => {
    if (messenger) {
      setInitials(Utils.getInitials(messenger.chatMessage.participant.name));
    }
  }, [messenger]);

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 5000);
    } else {
      electron.ipcRenderer.sendMessage('hideMessagePreview', {});
    }
  }, [counter]);

  const reply = () => {
    electron.ipcRenderer.sendMessage('replyMessage', {
      chatId: messenger.roomId
    });
  }

  const close = () => {
    electron.ipcRenderer.sendMessage('hideMessagePreview', {
      chatId: messenger.roomId
    });
  }

  return (
    messenger &&
    <div style={{width: '100%', height: '100%', backgroundColor: 'rgb(40, 40, 43)'}}>
      <div className={'centered-flex-box w-100'} style={{height: '60px', fontSize: '20px', fontWeight: '900', color: '#FFFFFF'}}>
        { messenger.chatMessage.participant.name }
      </div>
      <div className={'centered-flex-box w-100'} style={{height: '32px', fontSize: '20px', fontWeight: '500', color: '#FFFFFF'}}>
        {messenger.chatMessage.content}
      </div>
      <div className={'centered-flex-box w-100'} style={{height: 'calc(100% - 180px)'}}>
        <div className={'avatar'} data-label={initials}/>
      </div>
      <div className={'centered-flex-box '} style={{marginTop: '24px'}}>
        <div style={{ padding: '8px' }}>
          <Button
            onClick={() => reply()}
            variant="contained"
            color="primary"
            fullWidth={true}
            style={{ float: 'right', backgroundColor: '#01476C' }}
          >
            REPLY
          </Button>
        </div>

        <div style={{ padding: '8px' }}>
          <Button
            onClick={() => close()}
            variant="contained"
            color="primary"
            fullWidth={true}
            style={{ float: 'right', backgroundColor: 'red' }}
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
