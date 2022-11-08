import React, { useState } from 'react';
import { X } from 'react-feather';
import { components } from 'react-select';
import { Form } from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import TimePicker from '../customInput/TimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Files from '../customInput/Files';
import Utils from '../../Utils';
import Avatar from '../avatar';
import { get, host, post } from '../../service/RestService';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import { useNavigate } from 'react-router-dom';
import ModalComponent from '../customInput/Modal';
import { Select, InputLabel, MenuItem, Checkbox } from '@material-ui/core';
import EventMessageComponent from '../customInput/EventMessage';

const options = ['NONE', 'TEST'];

const Meeting = (props) => {
  const now = new Date();
  const [url, setUrl] = useState('');
  const [hostAttendee, setHostAttendee] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const { selectedEvent: selectedMeeting } = props;
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [edited, setEdited] = useState(false);
  const [eventRecurrence, setEventRecurrence] = React.useState('NONE');
  const [repeatingEvery, setRepeatingEvery] = React.useState('');
  const [numberOfOccurences, setNumberOfOccurences] = React.useState(1);
  const [monthlyPeriod, setMonthlyPeriod] = React.useState('');
  const [monthlyDay, setMonthlyDay] = React.useState('');
  const [monthlyDayType, setMonthlyDayType] = React.useState('monthlyWeekDay');
  const [monthlyCalendarDay, setMonthlyCalendarDay] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [weekDays, setWeekDays] = useState([]);
  const [recurrenceChecked, setRecurrenceChecked] = useState(false);

  const navigate = useNavigate();

  const getInitialValue = (propsValue) => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    let host = null;
    for (const attendee of props.selectedEvent.attendees) {
      if (attendee.type === 'HOST') {
        if (userDetails.userId === attendee.userId) {
          host = attendee;
          break;
        }
      }
    }

    return !Utils.isNull(host)
      ? {
          ...props.selectedEvent,
          ['attendees']: props.selectedEvent.attendees.filter(
            (item) => item.userId !== host.userId
          ),
        }
      : props.selectedEvent;
  };

  React.useEffect(() => {
    if (
      !Utils.isNull(props.selectedEvent) &&
      !Utils.isNull(props.selectedEvent.id) &&
      !Utils.isStringEmpty(props.selectedEvent.id)
    ) {
      setValue(getInitialValue(props.selectedEvent));
    } else {
      setValue({
        startDate:
          !Utils.isNull(props.selectedEvent) &&
          !Utils.isNull(props.selectedEvent.startDate)
            ? props.selectedEvent.startDate
            : now,
        //recurringStartDate: !Utils.isNull(props.selectedEvent) && !Utils.isNull(props.selectedEvent.recurringStartDate) ? props.selectedEvent.recurringStartDate : now,
        recurringStartDate: now,
        startTime: now,
        endDate:
          !Utils.isNull(props.selectedEvent) &&
          !Utils.isNull(props.selectedEvent.endDate)
            ? props.selectedEvent.endDate
            : now,
        // recurringEndDate: !Utils.isNull(props.selectedEvent) && !Utils.isNull(props.selectedEvent.recurringEndDate) ? props.selectedEvent.recurringEndDate : now,
        recurringEndDate: now,
        endTime: now,
        attendees: [],
        locations: [],
        documents: [],
        privacyType: 'PRIVATE',
      });
    }
  }, []);

  React.useEffect(() => {
    let isUpdate =
      !Utils.isNull(props.selectedEvent) &&
      !Utils.isNull(props.selectedEvent.id) &&
      !Utils.isStringEmpty(props.selectedEvent.id);
    if (!hostAttendee && isUpdate) {
      let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
      for (const attendee of props.selectedEvent.attendees) {
        if (attendee.type === 'HOST') {
          setHostAttendee(attendee);
          if (userDetails.userId === attendee.userId) {
            setReadOnly(false);
          }
        } else {
          attendees.push(attendee);
        }
      }
    }

    if (!isUpdate) {
      setReadOnly(false);
    }
  }, []);

  // ** Custom select components
  const OptionComponent = ({ data, ...props }) => {
    return (
      <components.Option {...props}>
        <span className={`bullet bullet-${data.color} bullet-sm me-50`} />
        {data.label}
      </components.Option>
    );
  };

  const GuestsComponent = ({ data, ...props }) => {
    return (
      <components.Option {...props}>
        <div className="d-flex flex-wrap align-items-center">
          <Avatar className="my-0 me-1" size="sm" img={data.avatar} />
          <div>{data.name}</div>
        </div>
      </components.Option>
    );
  };

  const hasErrors = (errorState) => {
    let properties = Object.getOwnPropertyNames(errorState);
    for (let i = 0; i < properties.length; i++) {
      if (errorState[properties[i]]) {
        return true;
      }
    }

    return false;
  };

  const createMeetingObject = (hostAttendee) => {
    let newAttendees = [].concat(value.attendees);
    newAttendees.push(hostAttendee);

    return {
      id: value.id,
      title: value.title,
      attendees: newAttendees, //[hostAttendee].concat(attendees),
      documents: value.documents,
      locations: value.locations,
      description: value.description,
      privacyType: value.privacyType,
      schedule: {
        startDate: Utils.getFormattedDate(value.startDate),
        startTime: value.startTime.toLocaleTimeString('it-IT'),
        endDate: Utils.getFormattedDate(value.endDate),
        endTime: value.endTime.toLocaleTimeString('it-IT'),
      },
    };
  };

  const handleAdd = () => {
    let errorState = {
      title: Utils.isNull(value.title),
      startDate: Utils.isNull(value.startDate),
      startTime: Utils.isNull(value.startTime),
      endDate: Utils.isNull(value.endDate),
      endTime: Utils.isNull(value.endTime),
    };

    setErrors(errorState);
    if (!hasErrors(errorState)) {
      let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
      let _hostAttendee;

      let isUpdate =
        !Utils.isNull(props.selectedEvent) &&
        !Utils.isNull(props.selectedEvent.id) &&
        !Utils.isStringEmpty(props.selectedEvent.id);
      if (isUpdate) {
        _hostAttendee = hostAttendee;
      } else {
        _hostAttendee = {
          userId: userDetails.userId,
          emailAddress: userDetails.emailAddress,
          name: userDetails.name,
          phoneNumber: userDetails.phoneNumber,
          type: 'HOST',
        };
      }

      let data = createMeetingObject(_hostAttendee);
      post(
        `${host}/api/v1/meeting/${isUpdate ? 'update' : 'create'}`,
        (response) => {
          handleClose();
        },
        (e) => {},
        data
      );
    }
  };

  const handleClose = () => {
    navigate('/view/calendar');
  };

  const handleUpdate = () => {
    handleAdd();
  };

  const handleDelete = (e) => {
    get(
      `${host}/api/v1/meeting/cancel/${value.id}`,
      (response) => {
        handleClose();
      },
      (e) => {}
    );
  };

  const handleJoin = (e) => {
    navigate('/view/joinMeetingSettings', { state: selectedMeeting });
  };

  const validateField = (fieldId, fieldValue) => {
    if (
      Utils.isNull(fieldValue) ||
      (typeof fieldValue === 'string' && Utils.isStringEmpty(fieldValue))
    ) {
      value[fieldId] = null;
      setErrors({ ...errors, [fieldId]: true });
      return false;
    }

    return true;
  };

  const handleFormValueChange = (fieldValue, id, required) => {
    if (required && !validateField(id, fieldValue)) {
      return;
    }

    setErrors({ ...errors, [id]: false });
    value[id] = fieldValue;

    if (!Utils.isNull(props.selectedEvent)) {
      setEdited(true);
    }
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  const handleEventRecurringClose = () => {
    setOpen(false);
  };

  const handleEventRecurringSave = () => {
    console.log('meetingValue', value);
    console.log('1. eventRecurrence', eventRecurrence);
    console.log('2. repeatingEvery', repeatingEvery);
    console.log('3. numberOfOccurences', numberOfOccurences);
    console.log('4. recurrenceChecked', recurrenceChecked);
    console.log('5. weekDays', weekDays);
    console.log('6. monthlyDayType', monthlyDayType);
    console.log('7. monthlyCalendarDay', monthlyCalendarDay);
    console.log('8. monthlyPeriod', monthlyPeriod);
    console.log('9. monthlyDay', monthlyDay);
    setOpen(false);
  };

  const handleEventRecurring = (e) => {
    setEventRecurrence(e.target.value);
    if (e.target.value !== 'NONE') {
      setRepeatingEvery(e.target.value);
      setNumberOfOccurences(1);
      setOpen(true);
      setMonthlyPeriod('');
      setMonthlyDay('');
      setMonthlyDayType('');
      setMonthlyCalendarDay(1);
      setWeekDays([]);
      if (e.target.value === 'MONTHLY') {
        setMonthlyPeriod('first');
        setMonthlyDay('Monday');
        setMonthlyDayType('monthlyWeekDay');
      }
    }
  };

  const handleMonthlyDay = (e) => {
    setMonthlyDay(e.target.value);
  };

  const handleMonthlyPeriod = (e) => {
    setMonthlyPeriod(e.target.value);
  };

  const handleWeekdayChange = (event) => {
    const index = weekDays.indexOf(event.target.value);
    if (index === -1) {
      setWeekDays([...weekDays, event.target.value]);
    } else {
      setWeekDays(weekDays.filter((weekDay) => weekDay !== event.target.value));
    }
  };

  const handleMonthlyChange = (event) => {
    const index = weekDays.indexOf(event.target.value);
    if (index === -1) {
      setWeekDays([...weekDays, event.target.value]);
    } else {
      setWeekDays(weekDays.filter((weekDay) => weekDay !== event.target.value));
    }
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (
      Utils.isNull(props.selectedEvent) ||
      Utils.isNull(props.selectedEvent.id) ||
      Utils.isStringEmpty(props.selectedEvent.id)
    ) {
      return (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'right',
            margin: '16px 0',
          }}
        >
          <div style={{ marginRight: '4px' }}>
            <Button
              onClick={(e) => handleAdd()}
              variant={'contained'}
              size="large"
              color={'primary'}
            >
              SEND
            </Button>
          </div>
          <Button variant={'text'} size="large" onClick={(e) => handleClose(e)}>
            CLOSE
          </Button>
        </div>
      );
    }

    return readOnly ? (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'right',
          margin: '16px 0',
        }}
      >
        <div style={{ marginRight: '4px' }}>
          <Button
            variant={'contained'}
            size="large"
            color={'primary'}
            onClick={(e) => handleClose(e)}
          >
            RESPOND
          </Button>
        </div>
        <Button
          variant={'contained'}
          size="large"
          color={'primary'}
          onClick={(e) => handleJoin(e)}
        >
          JOIN
        </Button>
        <Button variant={'text'} size="large" onClick={(e) => handleClose(e)}>
          CLOSE
        </Button>
      </div>
    ) : (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'right',
          margin: '16px 0',
        }}
      >
        <div style={{ marginRight: '4px' }}>
          <Button
            variant={'contained'}
            size="large"
            color={'primary'}
            onClick={(e) => handleJoin(e)}
          >
            JOIN
          </Button>
        </div>
        {edited ? (
          <div style={{ marginRight: '4px' }}>
            <Button
              variant={'contained'}
              size="large"
              color={'primary'}
              onClick={(e) => handleUpdate(e)}
            >
              SEND UPDATE
            </Button>
          </div>
        ) : null}
        <div style={{ marginRight: '4px' }}>
          <Button
            variant={'text'}
            size="large"
            onClick={(e) => handleDelete(e)}
          >
            CANCEL MEETING
          </Button>
        </div>
        <Button variant={'text'} size="large" onClick={(e) => handleClose(e)}>
          CLOSE
        </Button>
      </div>
    );
  };

  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={(e) => handleClose(e)} />
  );

  const onRecurrenceChecked = () => {
    console.log('recurrenceChecked', recurrenceChecked);
    setEventRecurrence('NONE');
    setRecurrenceChecked(!recurrenceChecked);
  };

  const setRecurrentBody = (
    value &&
    <div style={{ width: '100%' }}>
      <div className={'row no-margin'}>
        <div className={'col-*-*'}>
          <DatePicker
            label="Recurring Start date"
            id="startDate"
            disabled={readOnly}
            hasError={errors.startDate}
            value={value.startDate}
            required={true}
            valueChangeHandler={(date, id) =>
              handleFormValueChange(date, id, true)
            }
            errorMessage={
              'A recurring start date is required. Please select a value'
            }
          />
        </div>
      </div>

      <div className={'row no-margin'}>
        <p>&nbsp;&nbsp;&nbsp;</p>
      </div>

      <div className={'row no-margin'}>
        <div className={'col-*-*'}>
          <TextField
            disabled={readOnly}
            label="Repeat every"
            id="numberOfOccurencesId"
            type={'number'}
            value={numberOfOccurences}
            required={true}
            valueChangeHandler={(e) => {
              console.log(e.target.value);
              // if(e.target.value > 0 && e.target.value < 100) {
              setNumberOfOccurences(e.target.value);
              // }
            }}
            errorMessage={
              'Specify number of occurences required. Please enter a number'
            }
          />
          <br />
        </div>
        <div className={'col-*-*'}>
          <Select
            style={{ width: '100%' }}
            labelId="event-recurrence-label"
            id="setEventRecurrenceSelect"
            value={eventRecurrence}
            label="Set Recurrence"
            disabled={readOnly}
            onChange={handleEventRecurring}
          >
            <MenuItem value={'DAILY'}>Day</MenuItem>
            <MenuItem value={'WEEKLY'}>Week</MenuItem>
            <MenuItem value={'MONTHLY'}>Month</MenuItem>
          </Select>
          <br />
          <br />
        </div>

        {eventRecurrence === 'WEEKLY' ? (
          <div className={'col-*-*'}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('monday')}
                    onChange={handleWeekdayChange}
                    value="monday"
                  />
                }
                label="Mon"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('tuesday')}
                    onChange={handleWeekdayChange}
                    value="tuesday"
                  />
                }
                label="Tue"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('wednesday')}
                    onChange={handleWeekdayChange}
                    value="wednesday"
                  />
                }
                label="Wed"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('thursday')}
                    onChange={handleWeekdayChange}
                    value="thursday"
                  />
                }
                label="Thur"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('friday')}
                    onChange={handleWeekdayChange}
                    value="friday"
                  />
                }
                label="Fri"
              />
            </FormGroup>
          </div>
        ) : null}
      </div>

      {eventRecurrence === 'MONTHLY' ? (
        <RadioGroup
          aria-labelledby="radio-monthly-day-type-label"
          row
          disabled={readOnly}
          value={monthlyDayType}
          name="radio-buttons-group"
          onChange={(e, val) => {
            console.log('monthlyDayType1', val);
            console.log('before-monthlyDayType2', monthlyDayType);
            setMonthlyDayType(val);
            console.log('after-monthlyDayType3', monthlyDayType);
          }}
        >
          <div className={'row no-margin'}>
            <div className={'col-*-*'}>
              <FormControlLabel
                value="monthlyCalendarDay"
                control={<Radio />}
                label="On day"
              />
            </div>

            <div className={'col-*-*'}>
              <TextField
                disabled={monthlyDayType !== 'monthlyCalendarDay'}
                label="On day"
                id="monthlyCalendarDay"
                type={'number'}
                value={monthlyCalendarDay}
                required={true}
                valueChangeHandler={(e) => {
                  setMonthlyCalendarDay(e.target.value);
                }}
                errorMessage={'Please enter a number'}
              />
              <br />
            </div>
          </div>

          <div className={'row no-margin'}>
            <div className={'col-*-*'}>
              <FormControlLabel
                value="monthlyWeekDay"
                control={<Radio />}
                label="On the"
              />
            </div>

            <div className={'col-*-*'}>
              <Select
                style={{ width: '100%' }}
                labelId="monthly-period-label"
                id="monthlyPeriodSelect"
                value={monthlyPeriod}
                label="On the"
                disabled={monthlyDayType !== 'monthlyWeekDay'}
                onChange={handleMonthlyPeriod}
              >
                <MenuItem value={'first'}>First</MenuItem>
                <MenuItem value={'second'}>Second</MenuItem>
                <MenuItem value={'third'}>Third</MenuItem>
                <MenuItem value={'fourth'}>Fourth</MenuItem>
                <MenuItem value={'last'}>Last</MenuItem>
              </Select>
            </div>

            <div className={'col-*-*'}>
              <p>&nbsp;&nbsp;&nbsp;</p>
            </div>

            <div className={'col-*-*'}>
              <Select
                style={{ width: '100%' }}
                labelId="monthly-day-label"
                id="monthlyDaydSelect"
                value={monthlyDay}
                label="On the"
                disabled={monthlyDayType !== 'monthlyWeekDay'}
                onChange={handleMonthlyDay}
              >
                <MenuItem value={'Sunday'}>Sunday</MenuItem>
                <MenuItem value={'Monday'}>Monday</MenuItem>
                <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
                <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
                <MenuItem value={'Thursday'}>Thursday</MenuItem>
                <MenuItem value={'Friday'}>Friday</MenuItem>
                <MenuItem value={'Saturday'}>Saturday</MenuItem>
              </Select>
            </div>
          </div>

          <div className={'row no-margin'}>
            <p>&nbsp;&nbsp;&nbsp;</p>
          </div>
        </RadioGroup>
      ) : null}

      <div className={'row no-margin'}>
        <div className={'col-*-*'}>
          <DatePicker
            label="Recurring End date"
            id="endDate"
            disabled={readOnly}
            hasError={errors.endDate}
            value={value.endDate}
            required={true}
            valueChangeHandler={(date, id) =>
              handleFormValueChange(date, id, true)
            }
            errorMessage={
              'A recurring end date is required. Please select a value'
            }
          />
        </div>
      </div>

      <div className={'row no-margin'}>
        <div className={'col-*-*'}>
          <EventMessageComponent
            recurringType={eventRecurrence}
            numberOfOccurences={numberOfOccurences}
            monthlyDayType={monthlyDayType}
            monthlyCalendarDay={monthlyCalendarDay}
            monthlyDay={monthlyDay}
            monthlyPeriod={monthlyPeriod}
          />
        </div>
      </div>
    </div>
  );

  return (
    value && (
      <div
        style={{
          width: '100%',
          height: '88vh',
          padding: '32px',
          backgroundColor: '#FFFFFF',
          marginTop: '2px',
        }}
      >
        <h5 className="modal-title">
          {selectedMeeting &&
          selectedMeeting.title &&
          selectedMeeting.title.length
            ? ''
            : 'Add'}{' '}
          Meeting
        </h5>

        <div>
          <h2 className="text-center">
            <ModalComponent
              open={open}
              onClose={handleEventRecurringClose}
              onSave={handleEventRecurringSave}
              body={setRecurrentBody}
              openLabel={'Set recurrence'}
              modalHeader={'Set recurrence'}
            />
          </h2>
        </div>

        <div style={{ width: '80%' }}>
          <Form>
            {readOnly && !Utils.isNull(hostAttendee) ? (
              <div>From {hostAttendee.name}</div>
            ) : null}
            <div>
              <Files
                disabled={readOnly}
                enableFile={true}
                id={'documents'}
                value={value.documents}
                valueChangeHandler={(value, id) =>
                  handleFormValueChange(value, id, false)
                }
              />
            </div>
            <div>
              <TextField
                disabled={readOnly}
                label="Title"
                id="title"
                hasError={errors.title}
                value={value.title}
                required={true}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
                errorMessage={
                  'A meeting title is required. Please enter a value'
                }
              />
            </div>
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                row
                disabled={readOnly}
                defaultValue={value.privacyType}
                name="radio-buttons-group"
                onChange={(e, val) => {
                  handleFormValueChange(val, 'privacyType', true);
                }}
              >
                <FormControlLabel
                  value="PRIVATE"
                  control={<Radio disabled={readOnly} />}
                  label="Private"
                />
                <FormControlLabel
                  value="PUBLIC"
                  control={<Radio disabled={readOnly} />}
                  label="Public"
                />
              </RadioGroup>
            </FormControl>

            <div>
              <div>
                <div className={'row no-margin'}>
                  <div className={'col-*-*'}>
                    <DatePicker
                      label="Start date"
                      id="startDate"
                      disabled={readOnly}
                      hasError={errors.startDate}
                      value={value.startDate}
                      required={true}
                      valueChangeHandler={(date, id) =>
                        handleFormValueChange(date, id, true)
                      }
                      errorMessage={
                        'A start date is required. Please select a value'
                      }
                    />
                  </div>
                  <div className={'col-*-*'} style={{ paddingLeft: '8px' }}>
                    <TimePicker
                      label="Start time"
                      id="startTime"
                      disabled={readOnly}
                      hasError={errors.startTime}
                      value={value.startTime}
                      required={true}
                      valueChangeHandler={(date, id) =>
                        handleFormValueChange(date, id, true)
                      }
                      errorMessage={
                        'A start time is required. Please select a value'
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className={'row no-margin'}>
                  <div className={'col-*-*'}>
                    <DatePicker
                      label="End date"
                      disabled={readOnly}
                      id="endDate"
                      hasError={errors.endDate}
                      value={value.endDate}
                      required={true}
                      valueChangeHandler={(date, id) =>
                        handleFormValueChange(date, id, true)
                      }
                      errorMessage={
                        'An end date is required. Please select a value'
                      }
                    />
                  </div>

                  <div className={'col-*-*'} style={{ paddingLeft: '8px' }}>
                    <TimePicker
                      label="End time"
                      disabled={readOnly}
                      id="endTime"
                      hasError={errors.endTime}
                      value={value.endTime}
                      required={true}
                      valueChangeHandler={(date, id) =>
                        handleFormValueChange(date, id, true)
                      }
                      errorMessage={
                        'A end time is required. Please select a value'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div className={'row no-margin'}>
                <div className={'col-*-*'} style={{ width: '20%'}}>
                  <Select
                    style={{ width: '100%' }}
                    labelId="event-recurrence-label"
                    id="setEventRecurrenceSelect"
                    value={eventRecurrence}
                    label="Set Recurrence"
                    disabled={readOnly}
                    onChange={handleEventRecurring}
                  >
                    <MenuItem value={'NONE'}>Does Not Repeat</MenuItem>
                    <MenuItem value={'DAILY'}>Daily</MenuItem>
                    <MenuItem value={'WEEKLY'}>Weekly</MenuItem>
                    <MenuItem value={'MONTHLY'}>Monthly</MenuItem>
                  </Select>
                </div>
                {/*<div className={'col-*-* centered-flex-box'} style={{ marginLeft: '8px' }}>*/}
                {/*  <EventMessageComponent*/}
                {/*    recurringType={eventRecurrence}*/}
                {/*    numberOfOccurences={numberOfOccurences}*/}
                {/*    monthlyDayType={monthlyDayType}*/}
                {/*    monthlyCalendarDay={monthlyCalendarDay}*/}
                {/*    monthlyDay={monthlyDay}*/}
                {/*    monthlyPeriod={monthlyPeriod}*/}
                {/*  />*/}
                {/*</div>*/}
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <AutoComplete
                id="attendees"
                label={'Attendees'}
                disabled={readOnly}
                invalidText={'invalid attendee'}
                value={value.attendees}
                multiple={true}
                showImages={true}
                searchAttribute={'emailAddress'}
                validationRegex={/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/}
                valueChangeHandler={(value, id) => {
                  for (const valueElement of value) {
                    if (!valueElement.type) {
                      valueElement.type = 'REQUIRED';
                    }
                  }

                  setAttendees(value);
                  handleFormValueChange(value, id, false);
                }}
                optionsUrl={`${host}/api/v1/auth/search`}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <AutoComplete
                id="locations"
                label={'Locations'}
                disabled={readOnly}
                value={value.locations}
                multiple={true}
                validationRegex={/^[a-zA-Z0-9 ]*$/}
                searchAttribute={'name'}
                valueChangeHandler={(value, id) =>
                  handleFormValueChange(value, id, false)
                }
                optionsUrl={`${host}/api/v1/location/search`}
              />
            </div>
            <div>
              <TextField
                className={'text-area-wrapper'}
                label="Description"
                disabled={readOnly}
                id="description"
                value={value.description}
                height={'150px'}
                multiline={true}
                hasError={errors.description}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
              />
            </div>
            <div>
              {readOnly ? (
                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    row
                    defaultValue={value.privacyType}
                    name="radio-buttons-group"
                    onChange={(e, val) => {
                      handleFormValueChange(val, 'response', true);
                    }}
                  >
                    <FormControlLabel
                      value="YES"
                      control={<Radio />}
                      label="Accept"
                    />
                    <FormControlLabel
                      value="NO"
                      control={<Radio />}
                      label="Decline"
                    />
                    <FormControlLabel
                      value="Maybe"
                      control={<Radio />}
                      label="Tentative"
                    />
                  </RadioGroup>
                </FormControl>
              ) : null}
            </div>
            <div className="d-flex mb-1">
              <EventActions />
            </div>
          </Form>
        </div>
      </div>
    )
  );
};

export default Meeting;
