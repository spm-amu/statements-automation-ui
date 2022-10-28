import React, { useEffect, useState } from 'react';
import { Avatar } from '@material-ui/core';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../Icon';
import { Calendar } from 'react-feather';
import Utils from '../../Utils';

const ChatRoomItem = ({ event }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem('userDetails'))
  );

  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(JSON.parse(sessionStorage.getItem('userDetails')));
  }, []);

  const goToRoom = (id) => {
    navigate("/view/chats", {
      state: {
        id: id,
      }
    })
  };

  return (
    <div
      key={event.id}
      className="chatroom__item"
      onClick={() => {
        goToRoom(event.id);
      }}
    >
      <Avatar>
        {event.type === 'CALENDAR_MEETING' ? (
          <Calendar />
        ) : (
          Utils.getInitials(event.participants.find(p => p.userId !== currentUser.userId).name)
        )}
      </Avatar>
      <div className="chatroom__info">
        <div className="chatRoom__title">
          <p style={{ fontSize: '16px' }}>
            {event.type === 'CALENDAR_MEETING'
              ? event.title
              : event.participants.find(p => p.userId !== currentUser.userId).name }
          </p>
          <p>
            {Utils.isToday(event.updatedDate)
              ? moment(event.updatedDate).format('hh:mm')
              : moment(event.updatedDate).format('DD/MM')}
          </p>
        </div>
        <div className="chatroom__message">
          {event.messages.length > 0 && currentUser
            ? [
                event.messages[event.messages.length - 1].participant.userId ===
                currentUser.userId
                  ? [
                      event.messages[event.messages.length - 1].type ===
                      'FILE' ? (
                        <span>
                          {'You: '}
                          {event.messages[event.messages.length - 1].content ? (
                            event.messages[event.messages.length - 1].content
                          ) : (
                            <span>image</span>
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
                            <span>image</span>
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
