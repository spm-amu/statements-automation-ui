import React, { useEffect, useRef, useState } from 'react';
import CreateIcon from '@material-ui/icons/Create';
import { Avatar, IconButton } from '@material-ui/core';
import FileBase from 'react-file-base64';
import SendIcon from '@material-ui/icons/Send';
import CallIcon from '@material-ui/icons/Call';
import Tooltip from '@material-ui/core/Tooltip';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import { Link, useNavigate } from 'react-router-dom';
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
import Files from '../customInput/Files';

const ChatRoom = (props) => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(appManager.getUserDetails());
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(props.selectedChat);
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [confirm, setImgUploadConfirm] = useState('');
  const messagesEndRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketEventHandler] = useState({});

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'chat-room-122991829';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHAT_MESSAGE:
            onMessage(be.payload);
            break;
        }
      }
    }
  };

  // const onChatMessage = () => {
  //   if (be.payload.message.participant.userId !== currentUser.userId) {
  //     setMessages(oldMsgs => [...oldMsgs, be.payload.message]);
  //   }
  // };

  const onMessage = (payload) => {
    if(selectedChat && selectedChat.id === payload.roomId) {
      if(props.onMessage) {
        props.onMessage(payload.chatMessage, selectedChat);
      }

      selectedChat.messages.push(payload.chatMessage);
      loadMessages();
    }
  };

  const loadMessages = () => {
    scrollToBottom();

    if (selectedChat) {
      // const newMessages = messages.concat(selectedChat.messages);
      const newMessages = [].concat(selectedChat.messages);
      setMessages(newMessages);
    }

    setLoading(false);
  };

  useEffect(() => {
    setSelectedChat(props.selectedChat)
  }, [props.selectedChat]);

  useEffect(() => {
    loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    setCurrentUser(appManager.getUserDetails());
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHAT_MESSAGE);
  }, []);

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
  });

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const participantsUserIds = () => {
    return selectedChat
      .participants
      .filter(user => user.userId !== currentUser.userId)
      .map(user => user.userId);
  }

  const sendMessage = (e, finalMessage = null) => {
    e.preventDefault();

    if (message || document || finalMessage) {

      const msg = {
        createdDate: new Date(),
        type: document && document.length > 0 ? 'FILE' : 'TEXT',
        active: true,
        content: finalMessage ? finalMessage : message,
        participant: currentUser
      };

      if (document && document.length > 0) {
        msg.document = document[0];
      }

      msg.participant.active = true;

      const participantsToSignalIds = participantsUserIds();

      socketManager.emitEvent(MessageType.CHAT_MESSAGE, {
        roomId: selectedChat.id,
        chatMessage: msg,
        participantsToSignalIds,
        skipAlert: props.chatTab || finalMessage,
        newChat: selectedChat.messages.length === 0,
        meetingId: props.meetingId ? props.meetingId : null
      });

      setMessages(oldMsgs => [...oldMsgs, msg]);

      if (props.onMessage) {
        props.onMessage(msg, selectedChat);
      }

      scrollToBottom();
    }
    setMessage('');
    setImgUploadConfirm('');
    setDocument(null)
  };

  const callNow = (e) => {
    e.preventDefault();
    sendMessage(e, `${currentUser.name} has started a call.`);

    console.log('selectedChat: ', selectedChat);

    const directCallRoom = {
      id: uuid()
    };

    const participantsToSignalIds = participantsUserIds();

    socketManager.emitEvent(MessageType.CALL_MULTIPLE_USER, {
      room: directCallRoom.id,
      usersToCall: participantsToSignalIds,
      callerId: socketManager.socket.id,
      name: currentUser.name,
    });

    navigate("/view/meetingRoom", {
      state: {
        displayMode: 'window',
        selectedMeeting: directCallRoom,
        videoMuted: true,
        audioMuted: false,
        isDirectCall: true,
        isHost: true,
        usersToCall: participantsToSignalIds
      }
    })
  };

  const renderFileThumbnail = (message) => {
    const { document } = message;
    if (document.type.includes('image')) {
      return (
        <>
          <img
            src={document.payload}
            alt=""
            style={{ width: 250, height: 'auto' }}
          />
        </>
      )
    }

    if (document.type.includes('pdf')) {
      return (
        <div className={'col'}>
          <img
            src={require('../../assets/img/files/pdf.png')}
            alt=""
            style={{ width: 80, height: 80 }}
          />
          <p>{document.name}</p>
        </div>
      )
    }

    if (document.type.includes('doc')) {
      return (
        <div className={'col'}>
          <img
            src={require('../../assets/img/files/doc.png')}
            alt=""
            style={{ width: 80, height: 80 }}
          />
          <p>{document.name}</p>
        </div>
      )
    }

    if (document.type.includes('word')) {
      return (
        <div className={'col'}>
          <img
            src={require('../../assets/img/files/word.png')}
            alt=""
            style={{ width: 80, height: 80 }}
          />
          <p>{document.name}</p>
        </div>
      )
    }

    if (document.type.includes('xls')) {
      return (
        <div className={'col'}>
          <img
            src={require('../../assets/img/files/xls.png')}
            alt=""
            style={{ width: 80, height: 80 }}
          />
          <p>{document.name}</p>
        </div>
      )
    }

    return (
      <div className={'col'}>
        <img
          src={require('../../assets/img/files/php.png')}
          alt=""
          style={{ width: 80, height: 80 }}
        />
        <p>{document.name}</p>
      </div>
    )
  }

  const renderMessages = (message, index) => {
    if (message.type === 'FILE') {
      if (message.participant.userId === currentUser.userId) {
        return (
          <div key={index} className="chatroom__message">
            <div className="mychat">
              <span>{moment(message.createdDate).format('DD/MM, HH:mm')}</span>
              {
                renderFileThumbnail(message)
              }
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
              <span>{moment(message.createdDate).format('DD/MM, HH:mm')}</span>
              {
                renderFileThumbnail(message)
              }
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
              <span>{moment(message.createdDate).format('DD/MM, HH:mm')}</span>
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
              <span>{moment(message.createdDate).format('DD/MM, HH:mm')}</span>
              <p key={index}>{message.content}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (selectedChat && messages) {
    return (
      <div className="chatroom">
        <div className="chatroom__header">
          <div className="chatroom__headerleft">
            <Avatar>
              {selectedChat.type === 'CALENDAR_MEETING' || selectedChat.participants.length > 2 ? (
                <Calendar />
              ) : (
                Utils.getInitials(selectedChat.participants.find(p => p.userId !== currentUser.userId).name)
              )}
            </Avatar>

            <h5>
              { selectedChat.type === 'CALENDAR_MEETING' ? selectedChat.title : Utils.getChatMeetingTitle(selectedChat.participants, currentUser.userId, 58) }
            </h5>
          </div>
          <div className="chatroom__headerright">
            <Link to={`/room/${roomId}/1`} target="_blank">
              <Tooltip title="Call">
                <IconButton
                  onClick={(e) => {
                    callNow(e);
                  }}
                >
                  <CallIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </div>
        </div>
        <div id="messages" className="chatroom__body">
          {
            messages
              .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))?.map(renderMessages)
          }
          <div ref={messagesEndRef} />
        </div>
        <div>
          <form className="chatroom__sendMessage">
            <div
              className="message__imageSelector"
            >
              <Files
                enableFile={true}
                id={'documents'}
                value={document}
                valueChangeHandler={(value, id) => {
                  setDocument(value);
                  setImgUploadConfirm('File is selected and will be displayed after sending the message!');
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
                        sendMessage(e);
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
  } else if(!loading && selectedChat){
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
