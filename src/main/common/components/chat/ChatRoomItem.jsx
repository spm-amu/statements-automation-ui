import React, { useEffect, useState } from 'react';
import { Avatar } from '@material-ui/core';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../Icon';
import { Calendar } from 'react-feather';
import Utils from '../../Utils';
import appManager from "../../../common/service/AppManager";

const ChatRoomItem = (props) => {
  const { event, selectedChat } = props;
  const [currentUser, setCurrentUser] = useState(
    appManager.getUserDetails()
  );

  useEffect(() => {
    setCurrentUser(appManager.getUserDetails());
  }, []);

  const goToRoom = (id) => {
    props.selectionHandler(event);
  };

  return (
    <div
      className={`chatroom__item ${event.id === selectedChat.id ? 'active-tab' : ''}`}
      onClick={() => {
        goToRoom(event.id);
      }}
    >
      <Avatar>
        {event.type === 'CALENDAR_MEETING' || event.participants.length > 2 ? (
          <Calendar />
        ) : (
          Utils.getInitials(event.participants.find(p => p.userId !== currentUser.userId).name)
        )}
      </Avatar>
      <div className="chatroom__info">
        <div className="chatRoom__title">
          <p style={{ fontSize: '16px' }}>
            {event.type === 'CALENDAR_MEETING' || event.title
              ? event.title
              : Utils.getChatMeetingTitle(event.participants, currentUser.userId, 22)
            }
          </p>
          <p>
            {Utils.isToday(event.updatedAt)
              ? moment(event.updatedAt).format('HH:mm')
              : moment(event.updatedAt).format('DD/MM')}
          </p>
        </div>
        <div className="chatroom__message">
          {event.messages && event.messages.length > 0 && currentUser
            ? [
                event.messages[event.messages.length - 1].participant.userId === currentUser.userId
                  ? [
                      event.messages[event.messages.length - 1].type ===
                      'FILE' ? (
                        <span>
                          {'You: '}
                          {event.messages[event.messages.length - 1].content ? (
                            event.messages[event.messages.length - 1].content
                          ) : (
                            <span>document</span>
                          )}
                        </span>
                      ) : (
                        [
                          event.messages[event.messages.length - 1].content
                            .length > 42 ? (
                            <span>
                              {'You: '}
                              {event.messages[
                                event.messages.length - 1
                              ].content.slice(0, 42)}
                              {'...'}
                            </span>
                          ) : (
                            <span>
                              {'You: '}
                              {
                                event.messages[event.messages.length - 1].content
                              }
                            </span>
                          ),
                        ]
                      ),
                    ]
                  : [
                      event.messages[event.messages.length - 1].type ===
                      'FILE' ? (
                        <span>
                          {event.messages[event.messages.length - 1].participant.name}
                          {': '}
                          {event.messages[event.messages.length - 1].content ? (
                            event.messages[event.messages.length - 1].content
                          ) : (
                            <span>document</span>
                          )}
                        </span>
                      ) : (
                        [
                          event.messages[event.messages.length - 1].content.length > 42 ? (
                            <span>
                              {event.messages[event.messages.length - 1].participant.name}
                              {': '}
                              {event.messages[event.messages.length - 1].content.slice(0, 42)}
                              {'...'}
                            </span>
                          ) : (
                            <span>
                              {event.messages[event.messages.length - 1].participant.name}
                              {': '}
                              {
                                event.messages[event.messages.length - 1].content
                              }
                            </span>
                          ),
                        ]
                      ),
                    ],
              ]
            : null}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomItem;
