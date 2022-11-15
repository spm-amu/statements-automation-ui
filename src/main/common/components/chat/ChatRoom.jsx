import React, { useEffect, useRef, useState } from 'react';
import CreateIcon from '@material-ui/icons/Create';
import { Avatar, IconButton } from '@material-ui/core';
import FileBase from 'react-file-base64';
import SendIcon from '@material-ui/icons/Send';
import CallIcon from '@material-ui/icons/Call';
import Tooltip from '@material-ui/core/Tooltip';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import { Link } from 'react-router-dom';
import './ChatRooms.scss';
import moment from 'moment';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Face, Message } from '@material-ui/icons';
import styles from '../view/security/LoginStyle';
import CustomInput from '../customInput/CustomInput';
import LottieIcon from '../LottieIcon';
import { Calendar } from 'react-feather';
import Utils from '../../Utils';
import socketManager from '../../service/SocketManager';
import { MessageType } from '../../types';
import uuid from 'react-uuid';
import appManager from "../../../common/service/AppManager";

const ChatRoom = (props) => {
  const { selectedMeeting } = props;

  const [currentUser, setCurrentUser] = useState(appManager.getUserDetails());
  const [message, setMessage] = useState('');
  const [test, setTest] = useState(false);
  const [chatEvent, setChatEvent] = useState(null);
  const [file, setFile] = useState();
  const [messages, setMessages] = useState([]);
  const [confirm, setImgUploadConfirm] = useState('');
  const messagesEndRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  const handler = () => {
    return {
      get id() {
        return 'chatRoom-1223';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHAT_MESSAGE:
            onChatMessage(be);
            break;
        }
      }
    }
  };

  const eventHandler = useState({
    api: handler()
  });

  const onChatMessage = (be) => {
    if (be.payload.message.participant.userId !== currentUser.userId) {
      setMessages(oldMsgs => [...oldMsgs, be.payload.message]);
    }
  };

  const loadMessages = () => {
    scrollToBottom();

    /*let selectedEvent =  socketManager.chatEvents[0];

    if (selectedMeeting) {
      selectedEvent =  socketManager.chatEvents.find(event => event.id === selectedMeeting.id);
    }

    setChatEvent(selectedEvent);
    setMessages([].concat(selectedEvent.messages));
    */

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [selectedMeeting]);

  useEffect(() => {
    setCurrentUser(appManager.getUserDetails());
    socketManager.addSubscriptions(eventHandler, MessageType.CHAT_MESSAGE);
  }, []);

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      const msg = {
        createdDate: new Date(),
        id: uuid(),
        type: 'TEXT',
        content: message,
        participant: currentUser
      };

      msg.participant.active = true;

      socketManager.emitEvent(MessageType.CHAT_MESSAGE, {
        roomId: chatEvent.id,
        message: msg
      });

      setMessages(oldMsgs => [...oldMsgs, msg]);

      scrollToBottom();
    }
    setMessage('');
    setImgUploadConfirm('');
  };

  const callNow = () => {
    const finalMessage = {
      sender: currentUser.result.name,
      senderId: currentUser.result._id,
      message: `${currentUser.result.name} has started a video call. Click on the call icon to join the call.`,
      type: 'text',
      timestamp: new Date(),
    };
    setMessages((oldMsgs) => [...oldMsgs, finalMessage]);
  };

  const renderMessages = (message, index) => {
    if (message.type === 'FILE') {
      if (message.participant.userId === currentUser.userId) {
        return (
          <div key={index} className="chatroom__message">
            <div className="mychat">
              <span>{moment(message.createdDate).format('DD/MM, hh:mm')}</span>
              <img
                src={message.content}
                alt=""
                style={{ width: 250, height: 'auto' }}
              />
              <p key={index}>{message.content}</p>
            </div>
          </div>
        );
      }
      return (
        <div key={index} className="chatroom__message">
          <div className="peerchat">
            <Avatar>
              {Utils.getInitials(message.participant.name)}
            </Avatar>
            <div className="peer">
              <span>{message.participant.name}</span>
              <span>{moment(message.createdDate).format('DD/MM, hh:mm')}</span>
              <img
                src={message.content}
                alt=""
                style={{ width: 250, height: 'auto' }}
              />
              <p key={index}>{message.content}</p>
            </div>
          </div>
        </div>
      );
    } else {
      if (message.participant.userId === currentUser.userId) {
        return (
          <div key={index} className="chatroom__message">
            <div className="mychat">
              <span>{moment(message.createdDate).format('DD/MM, hh:mm')}</span>
              <p key={index}>{message.content}</p>
            </div>
          </div>
        );
      }
      return (
        <div key={index} className="chatroom__message">
          <div className="peerchat">
            <Avatar>
              {Utils.getInitials(message.participant.name)}
            </Avatar>
            <div className="peer">
              <span>{message.participant.name}</span>
              <span>{moment(message.createdDate).format('DD/MM, hh:mm')}</span>
              <p key={index}>{message.content}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  const uploadFileWithClick = () => {
    document
      .getElementsByClassName('message__imageSelector')[0]
      .childNodes[1].click();
  };

  if (selectedMeeting && messages) {
    return (
      <div className="chatroom">
        <div className="chatroom__header">
          <div className="chatroom__headerleft">
            <Avatar>
              {selectedMeeting.type === 'CALENDAR_MEETING' ? (
                <Calendar />
              ) : (
                Utils.getInitials(selectedMeeting.participants.find(p => p.userId !== currentUser.userId).name)
              )}
            </Avatar>

            <h5>
              { selectedMeeting.type === 'CALENDAR_MEETING' ? selectedMeeting.title : selectedMeeting.participants.find(p => p.userId !== currentUser.userId).name }
            </h5>

            <Tooltip title="Edit">
              <IconButton>
                <CreateIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div className="chatroom__headerright">
            <Link to={`/room/${roomId}/1`} target="_blank">
              <Tooltip title="Call">
                <IconButton
                  onClick={() => {
                    callNow();
                  }}
                >
                  <CallIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </div>
        </div>
        <div id="messages" className="chatroom__body">
          {messages.sort((a, b) => a - b)?.map(renderMessages)}
          <div ref={messagesEndRef} />
        </div>
        <div>
          <form className="chatroom__sendMessage">
            <div
              className="message__imageSelector"
              onClick={() => {
                uploadFileWithClick();
              }}
            >
              <PhotoLibraryIcon style={{ color: '#464775' }} />
              <FileBase
                className="message__image"
                type="file"
                multiple={false}
                onDone={({ base64 }) => {
                  setFile(base64);
                  setImgUploadConfirm(
                    'Image is selected and will be displayed after sending the message!'
                  );
                }}
              />
            </div>
            <CustomInput
              labelText="Type a new message"
              id="message"
              formControlProps={{ fullWidth: true }}
              autoFocus
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      style={styles.inputAdornmentIcon}
                      type="submit"
                      onClick={(e) => {
                        handleSubmit(e);
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                value: message,
                onChange: (e) => {
                  handleChange(e);
                },
              }}
            />
          </form>
        </div>
        <p className="image__text">{confirm}</p>
      </div>
    );
  } else if(!loading && selectedMeeting){
    return (
      <div className={'centered-flex-box'}>
        <div className="emptychat">
          <p className={'centered-flex-box'} style={{fontSize: '20px', fontWeight: 'bold'}}>You're starting a new conversation</p>
          <p className={'centered-flex-box'} style={{fontSize: '16px'}}>Type your first message below</p>
          <LottieIcon id={'chat'} />
        </div>
      </div>
    );
  } else {
        return null;
  }
};

export default ChatRoom;
