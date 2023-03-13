import React, {useEffect, useRef, useState} from 'react';
import {Avatar, IconButton} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import CallIcon from '@material-ui/icons/Call';
import Tooltip from '@material-ui/core/Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import './ChatRooms.scss';
import moment from 'moment';
import InputAdornment from '@material-ui/core/InputAdornment';
import styles from '../view/security/LoginStyle';
import CustomInput from '../customInput/CustomInput';
import LottieIcon from '../LottieIcon';
import {Calendar} from 'react-feather';
import Utils from '../../Utils';
import socketManager from '../../service/SocketManager';
import { MessageType, SystemEventType } from '../../types';
import appManager from "../../../common/service/AppManager";
import {GroupAdd, Info, Poll} from '@material-ui/icons';
import AutoComplete from '../customInput/AutoComplete';
import {get, post} from '../../service/RestService';
import {Form} from 'reactstrap';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ChatPoll from './ChatPoll';
import Linkify from "linkify-react";
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PollResult from './PollResult';
import File from "../customInput/File";
import Icon from '../Icon';
import PollContainer from './PollContainer';
const { electron } = window;

const ChatRoom = (props) => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(appManager.getUserDetails());
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(props.selectedChat);
  const [documents, setDocuments] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newParticipants, setNewParticipants] = useState([]);
  const [confirm, setImgUploadConfirm] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('CHAT');
  const [currentVote, setCurrentVote] = useState([]);
  const [clearUploadedFileSwitch, setClearUploadedFileSwitch] = useState(false);
  const [openAddPeople, setOpenAddPeople] = useState(false);
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
          case MessageType.SYSTEM_EVENT:
            onSystemEvent(be.payload);
            break;
        }
      }
    }
  };

  const fetchChat = () => {
    get(`${appManager.getAPIHost()}/api/v1/chat/fetchMeetingChat/${selectedChat.meetingId}`, (response) => {
      if (response && response.id) {
        setSelectedChat(response);
      }
    }, (e) => {

    }, '', false)
  };

  const closePollHandler = (e, poll) => {
    post(
      `${appManager.getAPIHost()}/api/v1/poll/close`,
      (response) => {
        sendMessage(e, `Poll: ${poll.question} has been closed.`);
        if (props.chatTab) {
          fetchChat();
        } else {
          props.addedPeopleHandler();
        }
      },
      (e) => {
      },
      {
        id: poll.id
      }
    );
  };

  const submitPollVoteHandler = (poll) => {
    let chatParticipant = selectedChat.participants.find(p => p.userId === currentUser.userId);

    const date = {
      pollId: poll.id,
      optionId: poll.selectedOption,
      chatParticipant: chatParticipant
    };

    post(
      `${appManager.getAPIHost()}/api/v1/poll/vote`,
      (response) => {
        if (!props.chatTab) {
          props.addedPeopleHandler();
        }
      },
      (e) => {
      },
      date
    );
  };

  const onSystemEvent = (payload) => {
    console.log(messages);
    if(payload.systemEventType === "NEW_POLL_VOTE") {
      let find = messages.find((msg) => msg.poll && msg.poll.id === payload.data.pollId);
      if(find) {
        //find.totalVotes++;
      }
    }
  };

  const onMessage = (payload) => {
    if (selectedChat && selectedChat.id === payload.roomId) {
      if (props.onMessage) {
        props.onMessage(payload.chatMessage, selectedChat);
      }

      if (payload.chatMessage.type === 'EVENT') {
        if (props.chatTab) {
          fetchChat();
        } else {
          props.addedPeopleHandler();
        }
      }

      selectedChat.messages.push(payload.chatMessage);
      loadMessages();
    }
  };

  const onDownload = (document) => {
    let documentFileUrl = '';

    if (document.id) {
      documentFileUrl = `${appManager.getAPIHost()}/api/v1/document/download/${document.id}`;
    } else {
      const encodedDocumentLocation = encodeURIComponent(document.location);
      documentFileUrl = `${appManager.getAPIHost()}/api/v1/document/download/location?documentLocation=${encodedDocumentLocation}`
    }

    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: documentFileUrl,
      },
    });
  };

  const loadMessages = () => {
    scrollToBottom();

    if (selectedChat) {
      const newMessages = [].concat(selectedChat.messages);
      const dateAddedToChat = selectedChat.participants.find(p => p.userId === currentUser.userId).dateAddedToChat;
      const filteredMessages = newMessages
        .filter(txt => dateAddedToChat === null || new Date(dateAddedToChat) < new Date(txt.createdDate));
      setMessages(filteredMessages);
    }

    setLoading(false);
  };


  const getChatRoomTitle = () => {
    if (selectedChat.type === 'CALENDAR_MEETING' || selectedChat.title) {
      return selectedChat.title;
    }

    return Utils.getChatMeetingTitle(selectedChat.participants, currentUser.userId, 58);
  };

  useEffect(() => {
    setSelectedChat(props.selectedChat)
  }, [props.selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessage('');
    setDocuments(null);
    loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    setCurrentUser(appManager.getUserDetails());
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHAT_MESSAGE, MessageType.SYSTEM_EVENT);
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
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const participantsUserIds = () => {
    return selectedChat
      .participants
      .filter(user => user.userId !== currentUser.userId)
      .map(user => user.userId);
  };

  const sendMessage = (e, finalMessage = null, poll = null) => {
    if (e) {
      e.preventDefault();
    }

    if (message || documents || finalMessage || poll) {

      let mType = 'TEXT';

      if (documents && documents.length > 0) {
        let combinedSize = 0;
        for (const doc of documents) {
          combinedSize = combinedSize + parseInt(doc.size);
        }

        if (combinedSize > 7500000) {
          appManager.fireEvent(SystemEventType.API_ERROR, {
            message: 'Attachment should be not more than 7.5MB.'
          });

          return;
        }

        mType = 'FILE';
      } else if (poll) {
        mType = 'POLL';
      } else if (finalMessage) {
        mType = 'EVENT'
      }

      const msg = {
        createdDate: new Date(),
        type: mType,
        active: true,
        content: finalMessage ? finalMessage : message,
        participant: currentUser
      };

      if (documents && documents.length > 0) {
        msg.documents = documents;
        setClearUploadedFileSwitch(!clearUploadedFileSwitch);
      }

      if (poll) {
        msg.poll = poll;
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
      }).catch((error) => {
      });

      setMessages(oldMsgs => [...oldMsgs, msg]);
      selectedChat.messages.push(msg);

      if (props.onMessage && selectedChat) {
        props.onMessage(msg, selectedChat);
      }
    }
    setMessage('');
    setImgUploadConfirm('');
    setDocuments(null)
  };

  const callNow = (e) => {
    e.preventDefault();
    sendMessage(e, `${currentUser.name} has started a call.`);
    get(
      `${appManager.getAPIHost()}/api/v1/meeting/generateId`,
      (response) => {
        const directCallRoom = {
          id: response
        };

        const participantsToSignalIds = participantsUserIds();
        socketManager.emitEvent(MessageType.CALL_MULTIPLE_USER, {
          room: directCallRoom.id,
          usersToCall: participantsToSignalIds,
          callerId: socketManager.socket.id,
          name: currentUser.name,
        }).catch((error) => {
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
      },
      (e) => {
      },
      '',
      true
    );
  };

  const addPeople = (e) => {
    if (newParticipants.length > 0) {
      newParticipants.forEach((participant) => {
        selectedChat.participants.push(participant);
      });

      post(
        `${appManager.getAPIHost()}/api/v1/chat/addParticipants`,
        (response) => {
          sendMessage(e, newParticipants[0].name + ' has join the conversation.');
          setNewParticipants([]);
          setOpenAddPeople(false);
          props.addedPeopleHandler();
        },
        (e) => {
        },
        {
          chatId: selectedChat.id,
          participants: newParticipants
        }
      );
    }
  };

  const handleClose = (e) => {
    setNewParticipants([]);
    setOpenAddPeople(false)
  };

  const openAddPeopleDialog = (e) => {
    setOpenAddPeople(true)
  };

  const renderFileThumbnail = (message) => {
    const { documents } = message;
    const thumbnails = [];

    documents.forEach((doc, index) => {
      if (doc.type.includes('image')) {
        return (
          thumbnails.push(
            <div style={{ borderBottom: '5px solid black' }}>
              <div key={index} className={'col'}>
                <img
                  key={index}
                  src={document.payload}
                  alt=""
                  style={{width: 250, height: 'auto'}}
                />
              </div>
              <IconButton
                component="span"
                onClick={() => onDownload(message.document[index])}
              >
                <Icon id={'DOWNLOAD'}/>
              </IconButton>
            </div>
          )
        )
      }

      if (doc.type.includes('pdf')) {
        thumbnails.push(
          <div key={index} style={{ borderBottom: '0.7px solid black' }}>
            <div className={'col'}>
              <img
                key={index}
                src={require('../../assets/img/files/pdf.png')}
                alt=""
                style={{width: 250, height: 'auto'}}
              />
            </div>
            <IconButton
              component="span"
              onClick={() => onDownload(documents[index])}
            >
              <Icon id={'DOWNLOAD'}/>
            </IconButton>
          </div>
        )
      } else if (doc.type.includes('doc')) {
        thumbnails.push(
          <div key={index} style={{ borderBottom: '5px solid black' }}>
            <div className={'col'}>
              <img
                key={index}
                src={require('../../assets/img/files/doc.png')}
                alt=""
                style={{width: 250, height: 'auto'}}
              />
            </div>
            <IconButton
              component="span"
              onClick={() => onDownload(documents[index])}
            >
              <Icon id={'DOWNLOAD'}/>
            </IconButton>
          </div>
        )
      } else if (doc.type.includes('word')) {
        thumbnails.push(
          <div key={index} style={{ borderBottom: '5px solid black' }}>
            <div className={'col'}>
              <img
                key={index}
                src={require('../../assets/img/files/word.png')}
                alt=""
                style={{width: 250, height: 'auto'}}
              />
            </div>
            <IconButton
              component="span"
              onClick={() => onDownload(documents[index])}
            >
              <Icon id={'DOWNLOAD'}/>
            </IconButton>
          </div>
        )
      } else if (doc.type.includes('xls')) {
        thumbnails.push(
          <div key={index} style={{ borderBottom: '5px solid black' }}>
            <div className={'col'}>
              <img
                key={index}
                src={require('../../assets/img/files/xls.png')}
                alt=""
                style={{width: 250, height: 'auto'}}
              />
            </div>
            <IconButton
              component="span"
              onClick={() => onDownload(documents[index])}
            >
              <Icon id={'DOWNLOAD'}/>
            </IconButton>
          </div>
        )
      } else {
        thumbnails.push(
          <div key={index}>
            <div className={'col'} style={{ borderBottom: '0.7px solid black', paddingBottom: '8px', borderWidth: '50%' }} >
              <img
                key={index}
                src={require('../../assets/img/files/php.png')}
                alt=""
                style={{width: 100, height: 'auto'}}
              />

              <p style={{ marginTop: '4px' }}>{ documents[index].name }</p>
            </div>
            <IconButton
              component="span"
              onClick={() => onDownload(documents[index])}
            >
              <Icon id={'DOWNLOAD'}/>
            </IconButton>
          </div>
        )
      }
    });

    return thumbnails;
  };

  const renderLink = ({ attributes, content }) => {
    const { href, ...props } = attributes;
    return <Link
      onClick={() => {
        window.open(href);
      }}
      {...props}
    >
      {content}
    </Link>;
  };

  const renderMessages = (message, index) => {
    if (message.type === 'FILE') {
      if (message.participant.userId === currentUser.userId) {
        return (
          <div key={index} className="chatroom__message">
            <div className="mychat">
              <div>{moment(message.createdDate).format('DD/MM, HH:mm')}</div>
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
              <div>
                {
                  renderFileThumbnail(message)
                }
              </div>
              <p key={index}>{message.content}</p>
            </div>
          </div>
        </div>
      );
    } else if (message.type === 'TEXT') {
      if (message.participant.userId === currentUser.userId) {
        return (
          <div key={index} className="chatroom__message">
            <div className="mychat">
              <span>{moment(message.createdDate).format('DD/MM, HH:mm')}</span>
              <Linkify key={index} options={{ render: renderLink }}>
                <p key={index}>{message.content}</p>
              </Linkify>
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
              <Linkify key={index} options={{ render: renderLink }}>
                <p key={index}>{message.content}</p>
              </Linkify>
            </div>
          </div>
        </div>
      );
    } else if (message.type === 'EVENT') {
      return (
        <div className="cv-poll-choice">
          <span className="cv-poll-choice-details">
          <span className="cv-choice-percentage">
              <Info
                className="selected-choice-icon"
              />
          </span>
          <span className="cv-choice-text">
              {message.content}
          </span>
          </span>
          <span className={'cv-choice-percent-chart event'} style={{width: '100%'}}>
          </span>
        </div>
      );
    } else {
      return <PollContainer
        poll={message.poll}
        pollCreator={message.participant}
        createdDate={message.createdDate}
        submitPollVoteHandler={(poll) => submitPollVoteHandler(poll)}
        pollParticipantIDs={selectedChat.participants.map(p => p.userId)}
        currentUser={currentUser}
        closePollHandler={(e, poll) => closePollHandler(e, poll)}
        numberOfPollParticipants={selectedChat.participants.length}
      />
    }
  };

  if (selectedChat && messages) {
    return (
      <div className="chatroom">
        <Dialog open={openAddPeople} onClose={handleClose}>
          <div style={{
            width: '560px',
            height: '100%',
            maxHeight: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: '32px',
            backgroundColor: '#FFFFFF',
            marginTop: '2px',
          }}>
            <h5 style={{fontSize: '24px'}}>Add People</h5>
            <Form>
              <div>
                <div style={{marginTop: '8px'}}>
                  <AutoComplete
                    id="participants"
                    label={'Participants'}
                    invalidText={'invalid participants'}
                    value={newParticipants}
                    multiple={true}
                    showImages={true}
                    searchAttribute={'emailAddress'}
                    validationRegex={/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/}
                    valueChangeHandler={(value, id) => {
                      setNewParticipants(value);
                    }}
                    optionsUrl={`${appManager.getAPIHost()}/api/v1/auth/search`}
                    fullWidth
                  />
                </div>
              </div>
            </Form>
          </div>
          <DialogActions>
            <Button onClick={handleClose}>CANCEL</Button>
            <Button
              onClick={addPeople}
              variant={'contained'}
              size="large"
              color={'primary'}
            >
              ADD
            </Button>
          </DialogActions>
        </Dialog>
        <div className="chatroom__header">
          <div className="chatroom__headerleft">
            <div className={'chat-avatar'}>
              <Avatar>
                {selectedChat.type === 'CALENDAR_MEETING' || selectedChat.participants.length > 2 ? (
                  <Calendar/>
                ) : (
                  Utils.getInitials(selectedChat.participants.find(p => p.userId !== currentUser.userId).name)
                )}
              </Avatar>
            </div>
            <h5>
              {getChatRoomTitle()}
            </h5>
          </div>
          <div className="chatroom__headerright">
            {
              !props.chatTab &&
              <>
                {/*<Tooltip title="Call">
                  <IconButton
                    onClick={(e) => {
                      callNow(e);
                    }}
                  >
                    <CallIcon/>
                  </IconButton>
                </Tooltip>*/}

                <Tooltip title="Add People">
                  <IconButton
                    onClick={(e) => {
                      openAddPeopleDialog(e);
                    }}
                  >
                    <GroupAdd/>
                  </IconButton>
                </Tooltip>
              </>
            }
            <Tooltip title="Poll">
              <IconButton
                onClick={(e) => {
                  setMode('POLL');
                }}
              >
                <Poll/>
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {
          mode === 'POLL' ?
            <ChatPoll
              chatTab={props.chatTab}
              participants={selectedChat.participants}
              createPollHandler={(pollData) => {
                sendMessage(null, null, pollData);
                setMode('CHAT');
              }}
              cancelPollHandler={() => {
                setMode('CHAT');
              }}
            /> :
            <div id="messages" className="chatroom__body">
              {
                messages
                  .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))?.map(renderMessages)
              }
              <div ref={messagesEndRef}>&nbsp;</div>
            </div>
        }

        {
          mode === 'CHAT' &&
          <div>
            <form className="chatroom__sendMessage">
              <div
                className="message__imageSelector" style={{width: '72px'}}
              />
              <div className={'chat-input'} style={{position: 'relative'}}>
                <div className={"file-upload chats-file-upload"} style={{zIndex: !Utils.isNull(documents) ? 1 : 0}}>
                  <File
                    enableFile={true}
                    multiple={true}
                    id={'documents'}
                    value={documents}
                    clearUploadedFileSwitch={clearUploadedFileSwitch}
                    valueChangeHandler={(value, id) => {
                      setDocuments(value);
                    }}
                  />
                </div>
                <CustomInput
                  style={{zIndex: !Utils.isNull(documents) ? 0 : 1}}
                  labelText={documents ? "" : "Type a new message"}
                  disabled={!Utils.isNull(documents)}
                  id="message"
                  formControlProps={{fullWidth: true}}
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
                          <SendIcon style={{fontSize: '24px'}}/>
                        </IconButton>
                      </InputAdornment>
                    ),
                    value: message,
                    onChange: (e) => {
                      handleChange(e);
                    },
                  }}
                />
              </div>
            </form>
          </div>
        }
      </div>
    );
  } else if (!loading && selectedChat) {
    return (
      <div className={'centered-flex-box'}>
        <div className="emptychat">
          <p className={'centered-flex-box'} style={{fontSize: '20px', fontWeight: 'bold'}}>You're starting a new
            conversation</p>
          <p className={'centered-flex-box'} style={{fontSize: '16px'}}>Type your first message below</p>
          <LottieIcon id={'chat'}/>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default ChatRoom;
