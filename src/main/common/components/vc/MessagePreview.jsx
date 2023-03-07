/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './InComingCallWindow.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Utils from '../../Utils';
import Button from '../RegularButton';

const {electron} = window;

const MessagePreview = (props) => {
  const [messenger, setMessenger] = useState(null);
  const [initials, setInitials] = useState('');
  const [counter, setCounter] = useState(0);
  const [startCounter, setStartCounter] = useState(false);

  const countRef = useRef(counter);
  countRef.current = counter;

  useEffect(() => {
    electron.ipcRenderer.on('messageViewContent', args => {
      setStartCounter(true);
      setMessenger(args.payload);
    });
  }, []);

  useEffect(() => {
    if (messenger) {
      setInitials(Utils.getInitials(messenger.chatMessage.participant.name));
    }
  }, [messenger]);

  useEffect(() => {
    let interval;
    if (startCounter) {
      interval = setInterval(() => {
        let currCount = countRef.current;
        setCounter(currCount => currCount + 1);
        console.log('In setInterval', currCount, counter);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [startCounter]);

  useEffect(() => {
    if (counter > 10) {
      setCounter(0);
      setStartCounter(false);
      close();
    }
  }, [counter]);

  const reply = () => {
    electron.ipcRenderer.sendMessage('replyMessage', {
      chatId: messenger.roomId
    });
  }

  const close = () => {
    electron.ipcRenderer.sendMessage('hideMessagePreview', {});
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
        {/*<div className={'avatar'} data-label={initials}/>*/}
      </div>
      <div className={'centered-flex-box '} style={{marginTop: '24px'}}>
        <div style={{ padding: '8px' }}>
          <Button
            onClick={() => reply()}
            variant="contained"
            color="primary"
            fullWidth={true}
            style={{ float: 'center', backgroundColor: '#01476C' }}
          >
            READ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
