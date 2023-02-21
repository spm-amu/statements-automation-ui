import React, { Fragment, useEffect, useState } from 'react';
import { Form } from 'reactstrap';
import TextField from '../customInput/TextField';
import Utils from '../../Utils';
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import './NewPoll.css'
import { Add } from '@material-ui/icons';
import SelectItem from '../customInput/SelectItem';
import { post } from '../../service/RestService';
import appManager from '../../service/AppManager'

const pollLengthDaysOptions = [
  {id: 0, label: "0"},
  {id: 1, label: "1"},
  {id: 2, label: "2"},
  {id: 3, label: "3"},
  {id: 4, label: "4"},
  {id: 5, label: "5"},
  {id: 6, label: "6"},
  {id: 7, label: "7"},
  {id: 8, label: "8"},
  {id: 9, label: "9"}
];

const pollLengthHoursOptions = [
  {id: 1, label: "1"},
  {id: 2, label: "2"},
  {id: 3, label: "3"},
  {id: 4, label: "4"},
  {id: 5, label: "5"},
  {id: 3, label: "6"},
  {id: 7, label: "7"},
  {id: 8, label: "8"},
  {id: 9, label: "9"},
  {id: 10, label: "10"},
  {id: 11, label: "11"},
  {id: 12, label: "12"},
];

const ChatPoll = (props) => {

  const [errors, setErrors] = useState({});
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollLengthDays, setPollLengthDays] = useState('0');
  const [pollLengthHours, setPollLengthHours] = useState('1');
  const [options, setOptions] = useState([
    {
      id: 'option-1',
      label: 'Option 1',
      value: ''
    },
    {
      id: 'option-2',
      label: 'Option 2',
      value: ''
    }
  ]);

  const getParticipantNames = () => {
    let listOfParticipants = '';
    for (const argument of props.participants) {
      listOfParticipants += argument.name + ', '
    }

    return listOfParticipants;
  }

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  const handleFormValueChange = (fieldValue, id, required) => {
    if (required && !validateField(id, fieldValue)) {
      return;
    }

    setErrors({...errors, [id]: false});
    if (id === 'pollQuestion') {
      setPollQuestion(fieldValue);
    }
  };

  const validateField = (fieldId, fieldValue) => {
    if (
      Utils.isNull(fieldValue) ||
      (typeof fieldValue === 'string' && Utils.isStringEmpty(fieldValue))
    ) {
      // value[fieldId] = null;
      setErrors({...errors, [fieldId]: true});
      return false;
    }

    return true;
  };

  const addOption = () => {
    const ops = options.slice();
    setOptions(ops.concat([{
      id: `option-${options.length + 1}`,
      label: `Option ${options.length + 1}`,
      value: ''
    }]));
  }

  const removeOption = (index) => {
    const ops = options.slice();
    setOptions([...ops.slice(0, index), ...ops.slice(index + 1)]);
  }

  const hasErrors = (errorState) => {
    let properties = Object.getOwnPropertyNames(errorState);
    for (let i = 0; i < properties.length; i++) {
      if (errorState[properties[i]]) {
        return true;
      }
    }

    return false;
  };

  const handleFormChange = (index, event) => {
    let data = [...options];
    data[index]['value'] = event.target.value;
    setOptions(data);
  }

  const sendPoll = () => {
    let errorState = {
      pollQuestion: pollQuestion.length === 0,
      pollOptions: options[0].value.length === 0 || options[1].value.length === 0
    };

    setErrors(errorState);

    if (!hasErrors(errorState)) {
      const data = {
        question: pollQuestion,
        pollLength: {
          days: pollLengthDays,
          hours: pollLengthHours
        },
        options: options
          .filter(option => option.value.length > 0)
          .map(option => {
          return {
            text: option.value
          }
        })
      };

      post(
        `${appManager.getAPIHost()}/api/v1/poll/create`,
        (response) => {
          props.createPollHandler(response);
        },
        (e) => {},
        data
      );
    }
  };

  return (
    <div
      className={'chat-container'}
    >
      <h5 style={{ fontSize: '24px', marginBottom: '8px' }}>
        Create Poll
      </h5>

      <p>Poll audience: <span style={{ fontWeight: '10' }}>{ getParticipantNames() } </span></p>

      <div style={{width: '100%'}}>
        <Form>
          <div className={props.chatTab ? "poll-input" : 'full-poll-input'}>
            <TextField
              className={'question-txt'}
              label="Question"
              id="pollQuestion"
              hasError={errors.pollQuestion}
              value={pollQuestion}
              required={true}
              valueChangeHandler={(e) => formValueChangeHandler(e)}
              errorMessage={
                'A poll question is required. Please enter a value'
              }
            />
          </div>

          {
            options.map((option, index) => {
              return (
                <div key={index} className={'row no-margin'}>
                  <Fragment>
                    <div className={props.chatTab ? options[index].id === 'option-1' || options[index].id === 'option-2' ? "poll-input" : "optional-poll-input" : 'full-poll-input'}>
                      <TextField
                        className={ options[index].id === 'option-1' || options[index].id === 'option-2' ? 'question-txt' : 'optional-choice' }
                        label={option.label}
                        id={option.id}
                        value={option.value}
                        valueChangeHandler={(e) => handleFormChange(index, e)}
                        hasError={errors.pollOptions}
                        errorMessage={
                          'At least two options required.'
                        }
                      />
                    </div>
                    {
                      options[index].id === 'option-1' || options[index].id === 'option-2' ?
                        null :
                        <div className={props.chatTab ? 'dynamic-delete-button' : null} style={{paddingLeft: '8px', width: '32px'}}>
                          <IconButton
                            onClick={() => removeOption(index)}
                          >
                            <DeleteIcon/>
                          </IconButton>
                        </div>
                    }
                  </Fragment>
                </div>
              )
            })
          }

          <Button
            onClick={() => addOption()}
            style={{ marginTop: '8px' }}
            variant="outlined"
            color={'primary'}
            disabled={options.length === 6}
            startIcon={
              <Add />
            }>
            Add Option
          </Button>

          <div className={'row no-margin'}>
            <div style={{ marginTop: '8px' }}>
              <SelectItem
                style={{ width: '80px', marginRight: '8px' }}
                label={'Poll Days'}
                labelId="poll-length-day"
                id="poll-length-day"
                value={pollLengthDays}
                valueChangeHandler={(e) =>  {
                  setPollLengthDays(e.target.value);
                }}
                options={pollLengthDaysOptions}
              />
            </div>

            <div style={{ marginTop: '8px' }}>
              <SelectItem
                style={{ width: '80px' }}
                label={'Poll Hours'}
                labelId="poll-length-hours"
                id="poll-length-hours"
                value={pollLengthHours}
                valueChangeHandler={(e) =>  {
                  setPollLengthHours(e.target.value);
                }}
                options={pollLengthHoursOptions}
              />
            </div>
          </div>

          <div
            className="d-flex mb-1"
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'right',
                margin: '16px 0',
              }}
            >
              <div style={{marginRight: '4px'}}>
                <Button
                  onClick={(e) => sendPoll()}
                  variant={'contained'}
                  size="large"
                  color={'primary'}
                >
                  SEND
                </Button>
              </div>
              <Button style={{marginRight: '4px'}} variant={'text'} size="large" onClick={(e) => props.cancelPollHandler()}>
                CANCEL
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
};


export default ChatPoll;
