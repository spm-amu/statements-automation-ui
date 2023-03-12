import React, { useEffect, useState } from 'react';
import {DataGrid} from "../DataGrid";
import appManager from "../../service/AppManager";
import PollResult from '../chat/PollResult';
import '../chat/ChatRooms.scss';
import Button from '@material-ui/core/Button';
import Utils from '../../Utils';

const grid = {
  "id": "meetingList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "pollQuestion",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "32.0%",
        "label": "Poll Question",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "fieldType": "DATE_TIME",
      "id": "createdDate",
      "attributes": {
        "filterable": false,
        "width": "32.0%",
        "label": "Created Date",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "viewActions",
      "attributes": {
        "filterable": false,
        "width": "32.0%",
        "label": "View",
        "toolbar": {
          "items": [
            {
              "id": "viewActions",
              "type": "iconButton",
              "icon": "LINK"
            }
          ]
        },
        "sortable": false
      }
    }

  ],
  "pageSize": 75
};

const ChatPollsHistoryView = (props) => {

  const [criteriaParams, setCriteriaParams] = useState({
    meetingId: props.meetingId
  });
  const [mode, setMode] = useState('LIST');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [winningOption, setWinningOption] = useState({});
  const [title, setTittle] = useState('Meeting Polls');

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
    setCriteriaParams({
      meetingId: props.meetingId
    })
  }, [props.meetingId]);

  useEffect(() => {
    if (selectedPoll) {
      setWinningOption(winningOptions(selectedPoll.options));
    }
  }, [selectedPoll]);

  return (
    <div style={{ width: '100%', display: 'flex', margin: '16px 0' }}>
      <div style={{ marginRight: '4px', width: '100%' }}>
        <ul>
          <li>
            <h3 className={'header-title'}>Chat Polls</h3>
          </li>
          {
            mode === 'LIST' ?
              <DataGrid config={grid}
                        bodyMaxHeight={"65vh"}
                        criteriaParams={criteriaParams}
                        dataUrl={`${appManager.getAPIHost()}/api/v1/meeting/fetchMeetingPollsHistory`}
                        retrieveOriginalData={true}
                        actionHandler={(e, originalData) => {
                          console.log('SELECTED POLL: ', originalData);
                          setMode('VIEW');

                          let sPoll = originalData.find(d => d.id === e.data.id);
                          setSelectedPoll(sPoll.poll);
                          setTittle(sPoll.question)
                        }}
              /> :
              <div  style={{ width: '100%', border: '0.5px solid black', padding: '8px' }}>
                <div style={{ width: '50%' }}>
                  {
                    selectedPoll &&
                    <p className="poll-creator-name" style={{ marginBottom: '8px' }}>
                      {selectedPoll.question}
                    </p>
                  }

                  {
                    selectedPoll &&
                    selectedPoll.options.map((option, index) => {
                      return <PollResult
                        key={index}
                        option={option}
                        isWinner={winningOption && option.id === winningOption.id}
                        isSelected={selectedPoll.selectedOption === option.id}
                        percentVote={calculatePercentage(selectedPoll, option)}
                      />
                    })
                  }

                  {
                    selectedPoll &&
                    <div className="poll-footer">
                    <span style={{marginLeft: '4px'}}
                          className="time-left">{`${selectedPoll.totalVotes} votes`}</span>
                      <span className="separator">•</span>
                      <span className="time-left" style={{marginLeft: '4px'}}>Closed / Expired</span>
                    </div>
                  }

                  {
                    selectedPoll &&
                    <div
                      className="d-flex mb-1"
                    >
                      <div
                        style={{
                          margin: '16px 0',
                        }}
                      >
                        <Button
                          style={{marginRight: '4px'}}
                          variant={'text'}
                          size="large"
                          onClick={(e) => {
                            setMode('LIST');
                            setTittle('Chat Polls');
                            setSelectedPoll(null);
                          }}
                        >
                          BACK
                        </Button>
                      </div>
                    </div>
                  }
                </div>
              </div>
          }
        </ul>
      </div>
    </div>
  );
};

export default ChatPollsHistoryView;
