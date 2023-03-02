import React, { useEffect, useState } from 'react';
import './ChatRooms.scss';
import { Avatar } from '@material-ui/core';
import Utils from '../../Utils';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import socketManager from '../../service/SocketManager';
import { MessageType } from '../../types';
import PollResult from './PollResult';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import appManager from '../../service/AppManager';

const PollContainer = (props) => {
  const [pollOptions, setPollOptions] = useState([]);
  const [poll, setPoll] = useState({});
  const [pollClosed, setPollClosed] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [socketEventHandler] = useState({});


  const socketEventHandlerApi = () => {
    return {
      get id() {
        return `poll-container-${props.poll.id}`;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.SYSTEM_EVENT:
            onSystemEvent(be.payload);
            break;
        }
      }
    }
  };

  const onSystemEvent = (payload) => {
    if(payload.systemEventType === "NEW_POLL_VOTE" && payload.data.pollId === poll.id) {
      setTotalVotes(totalVotes + 1);
    }
  };

  const pollRemainingTime = (expirationDateTime) => {
    const expirationTime = new Date(expirationDateTime).getTime();
    const currentTime = new Date().getTime();

    const difference_ms = expirationTime - currentTime;
    const seconds = Math.floor((difference_ms / 1000) % 60);
    const minutes = Math.floor((difference_ms / 1000 / 60) % 60);
    const hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

    let timeRemaining;

    if (days > 0) {
      timeRemaining = days + " days left";
    } else if (hours > 0) {
      timeRemaining = hours + " hours left";
    } else if (minutes > 0) {
      timeRemaining = minutes + " minutes left";
    } else if (seconds > 0) {
      timeRemaining = seconds + " seconds left";
    } else {
      timeRemaining = "less than a second left";
    }

    return timeRemaining;
  };

  const calculatePercentage = (renderedPoll, option) => {
    if (renderedPoll.totalVotes === 0) {
      return 0;
    }
    return (option.voteCount * 100) / (renderedPoll.totalVotes);
  };

  const winningOptions = (options) => {
    return options.reduce((prevOption, currentOption) =>
        currentOption.voteCount > prevOption.voteCount ? currentOption : prevOption,
      {voteCount: -Infinity}
    );
  };

  useEffect(() => {
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

  useEffect(() => {
    console.log('___ POLL: ', props.poll);

    if (props.poll) {
      const renderedPoll = props.poll;

      setPoll(renderedPoll);
      setTotalVotes(renderedPoll.totalVotes ? renderedPoll.totalVotes : 0);
      const pollOptionRows = [];
      const closed = renderedPoll.isExpired || !renderedPoll.open;
      setPollClosed(closed);

      if (closed) {
        const winningOpt = winningOptions(renderedPoll.options);

        renderedPoll.options.forEach(option => {
          pollOptionRows.push(
            <PollResult
              key={option.id}
              option={option}
              isWinner={winningOpt && option.id === winningOpt.id}
              isSelected={renderedPoll.selectedOption === option.id}
              percentVote={calculatePercentage(renderedPoll, option)}
            />
          );
        });
      } else {
        renderedPoll.options.forEach(option => {
          pollOptionRows.push(
            <FormControlLabel
              key={option.id}
              className="poll-choice-radio"
              value={option.id}
              control={
                <Radio/>
              }
              label={option.text}
            />
          )
        })
      }

      setPollOptions(pollOptionRows);
    }
  }, [props.poll]);

  return (
    <div className="poll-content">
      <div className="poll-header">
        <div className="poll-creator-info">
          <div>
            <Avatar
              className="poll-creator-avatar"
              style={{backgroundColor: Utils.getAvatarColor(props.pollCreator.name)}}>
              {props.pollCreator.name.toUpperCase()}
            </Avatar>
            <span className="poll-creator-name">
                    {props.pollCreator.name}
                </span>
            <span className="poll-creation-date">
                    {Utils.formatDateTime(props.createdDate)}
                </span>
          </div>
        </div>
        <div className="poll-question">
          {poll.question}
        </div>
        <div className="poll-creation-date">
          Results are visible after the poll has closed / expired.
        </div>
      </div>
      <div className="poll-choices">
        <FormControl style={{width: '100%'}}>
          <RadioGroup
            className="poll-choice-radio-group"
            value={currentVote ? currentVote : poll.selectedOption ? poll.selectedOption : ''}
            onChange={(e) => {
              console.log('SELECTED ON CHANGE: ', e.target.value);
              setCurrentVote(e.target.value);
            }}
          >
            {pollOptions}
          </RadioGroup>
        </FormControl>
      </div>

      {
        !pollClosed ?
          <div className="poll-footer">
            <Button
              className="vote-button"
              variant={'outlined'}
              onClick={() => {
                poll.selectedOption = currentVote ? currentVote : '';
                props.submitPollVoteHandler(poll);

                console.log('### IDs: ', props.pollParticipantIDs);

                socketManager.emitEvent(MessageType.SYSTEM_EVENT, {
                  systemEventType: "NEW_POLL_VOTE",
                  recipients: props.pollParticipantIDs,
                  data: {
                    pollId: poll.id
                  }
                });
              }}
            >
              Submit Vote
            </Button>

            {
              props.currentUser.userId === props.pollCreator.userId &&
              <Button
                className="vote-button"
                variant={'outlined'}
                onClick={(e) => {
                  props.closePollHandler(e, poll);
                }}
                style={{marginLeft: '8px'}}
              >
                Close Poll
              </Button>
            }

            <span style={{marginLeft: '8px'}}
                  className="time-left">
              {`${totalVotes} votes out of ${props.numberOfPollParticipants}`}
            </span>

            <span className="separator">•</span>
            <span className="time-left" style={{marginLeft: '4px'}}>
              {
                pollRemainingTime(poll.expirationDateTime)
              }
            </span>

            {
              poll.selectedOption &&
              <div className="poll-creation-date">
                <span style={{color: '#945c33'}}>You have Voted</span>
              </div>
            }
          </div> :
          <div className="poll-footer">
                <span style={{marginLeft: '4px'}}
                      className="time-left">{`${totalVotes} voted out of ${props.numberOfPollParticipants}`}</span>
            <span className="separator">•</span>
            <span className="time-left" style={{marginLeft: '4px'}}>Closed / Expired</span>
          </div>
      }
    </div>
  )
};


export default PollContainer;
