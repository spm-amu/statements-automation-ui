import React, {Fragment, useState} from 'react';
import {components} from 'react-select';
import {Form} from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import CustomTimePicker from '../customInput/CustomTimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Files from '../customInput/Files';
import Utils from '../../Utils';
import Avatar from '../avatar';
import {get, post} from '../../service/RestService';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import {useNavigate} from 'react-router-dom';
import { Checkbox, Switch } from '@material-ui/core';
import appManager from "../../../common/service/AppManager";
import AlertDialog from "../AlertDialog";
import SelectItem from "../customInput/SelectItem";
import moment from 'moment';

const options = ['NONE', 'TEST'];
const recurrenceOptions = [
  {id: 'NONE', label: "Does not repeat"},
  {id: 'DAILY', label: "Daily"},
  {id: 'WEEKLY', label: "Weekly"},
  {id: 'MONTHLY', label: "Monthly"}
];
const recurrenceIntervalOptions = [
  {id: 'DAILY', label: "Day"},
  {id: 'WEEKLY', label: "Week"},
  {id: 'MONTHLY', label: "Month"}
];

const bySetPosOptions = [
  {id: 1, label: "First"},
  {id: 2, label: "Second"},
  {id: 3, label: "Third"},
  {id: 4, label: "Fourth"},
  {id: -1, label: "Last"},
];

const byWeekDayOptions = [
  {id: "SU", label: "Sunday"},
  {id: "MO", label: "Monday"},
  {id: "TU", label: "Tuesday"},
  {id: "WE", label: "Wednesday"},
  {id: "TH", label: "Thursday"},
  {id: "FR", label: "Friday"},
  {id: "SA", label: "Saturday"},
];

const Meeting = (props) => {
  const now = new Date();
  const [url, setUrl] = useState('');
  const [hostAttendee, setHostAttendee] = useState(null);
  const [newHostAttendee, setNewHostAttendee] = useState([]);
  const [lapsed, setLapsed] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const {selectedEvent: selectedMeeting} = props;
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [edited, setEdited] = useState(false);
  const [bysetpos, setBysetpos] = React.useState(1);
  const [byWeekDay, setByWeekDay] = React.useState('MO');
  const [refresher, setRefresher] = React.useState(false);
  const [recurrenceRepetition, setRecurrenceRepetition] = useState('NONE');
  const [recurrence, setRecurrence] = React.useState({
    repeatingEvery: '',
    numberOfOccurences: 1,
    bysetpos: 1,
    byWeekDay: '',
    monthlyDayType: 'monthlyWeekDay',
    byMonthDay: 0,
    weekDays: []
  });

  const [savePromiseContext, setSavePromiseContext] = useState(null);
  const [cancelPromiseContext, setCancelPromiseContext] = useState(null);
  const [invalidAttendeesPromiseContext, setInvalidAttendeesPromiseContext] = useState(null);
  const navigate = useNavigate();

  const getInitialValue = (propsValue) => {
    console.log("selectedEvent", props.selectedEvent);
    let userDetails = appManager.getUserDetails();
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
      if (props.selectedEvent.recurringFreq !== null) {
        const rec = {};

        rec.repeatingEvery = props.selectedEvent.recurringFreq;
        rec.eventRecurrence = props.selectedEvent.recurringFreq;
        rec.numberOfOccurences = props.selectedEvent.recurringInterval;

        if (props.selectedEvent.recurringFreq === 'MONTHLY') {
          if (props.selectedEvent.recurringBymonthday !== null) {
            rec.monthlyDayType = "monthlyCalendarDay";
            rec.byMonthDay = props.selectedEvent.recurringBymonthday;
          } else {
            rec.monthlyDayType = "monthlyWeekDay";
            rec.bysetpos = props.selectedEvent.recurringBysetpos;
            rec.byWeekDay = props.selectedEvent.recurringByweekday[0];
            setBysetpos(props.selectedEvent.recurringBysetpos);
            setByWeekDay(props.selectedEvent.recurringByweekday[0]);
          }
        } else if (props.selectedEvent.recurringFreq === 'WEEKLY') {
          rec.weekDays = props.selectedEvent.recurringByweekday;
        }

        setRecurrence(rec);
      }

      if (props.selectedEvent.recurringFreq) {
        setRecurrenceRepetition(props.selectedEvent.recurringFreq);
      }

      setValue(getInitialValue(props.selectedEvent));
      setLapsed(props.selectedEvent.endDate < new Date() && props.selectedEvent.status !== 'SESSION_IN_PROGRESS');
    } else {
      setValue({
        startDate:
          !Utils.isNull(props.selectedEvent) &&
          !Utils.isNull(props.selectedEvent.startDate)
            ? props.selectedEvent.startDate
            : now,
        recurringDtstart: props.selectedEvent.startDate,
        startTime: now,
        endDate:
          !Utils.isNull(props.selectedEvent) &&
          !Utils.isNull(props.selectedEvent.endDate)
            ? props.selectedEvent.endDate
            : now,
        recurringUntil: props.selectedEvent.endDate,
        endTime: now,
        attendees: [],
        locations: [],
        documents: [],
        privacyType: 'PRIVATE',
        askToJoin: true
      });
    }

    let isUpdate =
      !Utils.isNull(props.selectedEvent) &&
      !Utils.isNull(props.selectedEvent.id) &&
      !Utils.isStringEmpty(props.selectedEvent.id);
    if (!hostAttendee && isUpdate) {
      let userDetails = appManager.getUserDetails();
      for (const attendee of props.selectedEvent.attendees) {
        if (attendee.type === 'HOST') {
          setHostAttendee(attendee);
          setNewHostAttendee([].concat(attendee));
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

    if (props.selectedEvent.startDate < moment(new Date()).startOf('day')) {
      setReadOnly(true);
    }

  }, []);

  // ** Custom select components
  const OptionComponent = ({data, ...props}) => {
    return (
      <components.Option {...props}>
        <span className={`bullet bullet-${data.color} bullet-sm me-50`}/>
        {data.label}
      </components.Option>
    );
  };

  const GuestsComponent = ({data, ...props}) => {
    return (
      <components.Option {...props}>
        <div className="d-flex flex-wrap align-items-center">
          <Avatar className="my-0 me-1" size="sm" img={data.avatar}/>
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
    console.log('____________ NEW HOST: ', hostAttendee);
    let newAttendees = [].concat(value.attendees);
    newAttendees.push(hostAttendee);

    const eventData = {
      id: value.id,
      title: value.title,
      attendees: newAttendees, //[hostAttendee].concat(attendees),
      documents: value.documents,
      locations: value.locations,
      description: value.description,
      privacyType: value.privacyType,
      askToJoin: value.askToJoin,
      schedule: {
        id: props.selectedEvent ? props.selectedEvent.scheduleId : null,
        startDate: recurrenceRepetition !== 'NONE' ? Utils.getFormattedDate(value.recurringDtstart) : Utils.getFormattedDate(value.startDate),
        startTime: value.startTime.toLocaleTimeString('it-IT'),
        endDate: recurrenceRepetition !== 'NONE' ? Utils.getFormattedDate(value.recurringUntil) : Utils.getFormattedDate(value.endDate),
        endTime: value.endTime.toLocaleTimeString('it-IT')
      },
    };

    if (recurrenceRepetition !== 'NONE') {
      let recEndDate = new Date(Utils.getFormattedDate(value.recurringUntil));
      // let untilDateMilli = recEndDate.setDate(recEndDate.getDate() + 1);
      //recEndDate.setDate(recEndDate.getDate() + 1);

      eventData.schedule.rrule = {
        freq: recurrenceRepetition,
        interval: recurrence.numberOfOccurences,
        dtstart: moment(Utils.getFormattedDate(value.recurringDtstart) + " " + value.startTime.toLocaleTimeString()),
        until: new Date(recEndDate)
      };

      if (recurrenceRepetition === 'WEEKLY') {
        let occurs = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

        if (recurrence.weekDays && recurrence.weekDays.length > 0) {
          occurs = recurrence.weekDays;
        }

        eventData.schedule.rrule.byweekday = occurs;
      }

      if (recurrenceRepetition === 'MONTHLY') {
        eventData.schedule.rrule.monthlyDayType = recurrence.monthlyDayType;
        if (recurrence.monthlyDayType === 'monthlyCalendarDay') {
          eventData.schedule.rrule.bymonthday = recurrence.byMonthDay;
        } else {
          eventData.schedule.rrule.bysetpos = recurrence.bysetpos;
          eventData.schedule.rrule.byweekday = [recurrence.byWeekDay];
        }
      }
    }

    return eventData;
  };

  const handleAdd = () => {
    console.log('______ V: ', value);

    const checkStartDate = recurrenceRepetition !== 'NONE' ?  value.recurringDtstart : value.startDate;
    const endStartDate = recurrenceRepetition !== 'NONE' ?  value.recurringUntil : value.endDate;

    const meetingStartDateTime = !Utils.isNull(checkStartDate) && !Utils.isNull(value.startTime) ?
      moment(Utils.getFormattedDate(checkStartDate) + " " + value.startTime.toLocaleTimeString()) : null;
    const meetingEndDateTime = !Utils.isNull(endStartDate) && !Utils.isNull(value.endTime) ?
      moment(Utils.getFormattedDate(endStartDate) + " " + value.endTime.toLocaleTimeString()) : null;

    let errorState = {
      title: Utils.isNull(value.title),
      attendees: value.attendees.length === 0,
      startDate: !moment(checkStartDate).isValid() || Utils.isNull(meetingStartDateTime) || meetingStartDateTime.isBefore(moment()),
      startTime: !moment(value.startTime).isValid() || Utils.isNull(meetingStartDateTime) || meetingStartDateTime.isBefore(moment()),
      endDate: !moment(endStartDate).isValid() || Utils.isNull(meetingEndDateTime) || meetingEndDateTime.isBefore(moment()) || meetingEndDateTime <= meetingStartDateTime,
      endTime: !moment(value.endTime).isValid() || Utils.isNull(meetingEndDateTime) || meetingEndDateTime.isBefore(moment()) || meetingEndDateTime <= meetingStartDateTime
    }

    console.log('*****: ', errorState);

    setErrors(errorState);

    if (!hasErrors(errorState)) {
      let userDetails = appManager.getUserDetails();
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

      getMeetingObject(_hostAttendee, isUpdate)
        .then((data) => validateAttendees(data))
        .then((data) => {
          post(
            `${appManager.getAPIHost()}/api/v1/meeting/${isUpdate ? 'update' : 'create'}`,
            (response) => {
              handleClose();
            },
            (e) => {
            },
            data,
            "The meeting details have been saved successfully"
          );
      }, () => {
      });

    }
  };

  const getMeetingObject = (hostAttendee, isUpdate) => {
    return new Promise((resolve, reject) => {

      let data = createMeetingObject(hostAttendee);

      if (isUpdate) {
        const updatedHost = newHostAttendee[0];
        const userDetails = appManager.getUserDetails();

        if (updatedHost && userDetails.userId !== updatedHost.userId) {
          let currentHost = data.attendees.find((attendee) => attendee.type === 'HOST');
          currentHost.type = 'REQUIRED';

          let newHost = data.attendees.find((attendee) => attendee.userId === updatedHost.userId);
          newHost.type = 'HOST';
        }
      }

      let externalAttendees = data.attendees.filter((attendee) => attendee.external === true);

      if (data.documents && data.documents.length > 0) {
        let newDocs = data.documents.filter((doc) => Utils.isNull(doc.id));
        let shouldWarn = externalAttendees.length > 0 && newDocs.length > 0;

        if (!shouldWarn) {
          let newlyAddedExternalAttendees = externalAttendees.filter((attendee) => Utils.isNull(attendee.id));
          shouldWarn = newlyAddedExternalAttendees.length > 0;
        }

        if (shouldWarn) {
          setSavePromiseContext({
            reject,
            resolve,
            data
          });

          return;
        }
      }

      resolve(data)
    });
  };

  const validateAttendees = (data) => {
    return new Promise((resolve, reject) => {
      const attendeeElement = document.getElementById('attendees');

      let invalidAttendeesSelectedWarning = attendeeElement.value && attendeeElement.value.length > 0;

      for(let i = 0; i < data.attendees.length; i++) {
        if(Utils.isNull(data.attendees[i].type)) {
          invalidAttendeesSelectedWarning = true;
          data.attendees.splice(i, 1);
        }
      }

      if (invalidAttendeesSelectedWarning) {
        setInvalidAttendeesPromiseContext({
          reject,
          resolve,
          data
        });

        return;
      }

      resolve(data)
    });
  };

  const handleClose = () => {
    navigate('/view/calendar');
  };

  const handleUpdate = () => {
    handleAdd();
  };

  const handleDelete = (e) => {
    cancelMeeting().then((data) => {
      get(
        `${appManager.getAPIHost()}/api/v1/meeting/cancel/${value.id}`,
        (response) => {
          handleClose();
        },
        (e) => {
        },
        "The meeting has been cancelled successfully"
      );
    }, () => {
    });
  };

  const cancelMeeting = () => {
    return new Promise((resolve, reject) => {
      setCancelPromiseContext({
        reject,
        resolve,
        value
      });
    });
  };

  const handleJoin = (e) => {
    navigate('/view/joinMeetingSettings', {state: selectedMeeting});
  };

  const validateField = (fieldId, fieldValue) => {
    if (
      Utils.isNull(fieldValue) ||
      (typeof fieldValue === 'string' && Utils.isStringEmpty(fieldValue))
    ) {
      value[fieldId] = null;
      setErrors({...errors, [fieldId]: true});
      return false;
    }

    return true;
  };

  const handleFormValueChange = (fieldValue, id, required) => {
    if (required && !validateField(id, fieldValue)) {
      return;
    }

    setErrors({...errors, [id]: false});
    value[id] = fieldValue;

    if (!Utils.isNull(props.selectedEvent)) {
      setEdited(true);
    }
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  const handleEventRecurring = (e) => {
    let recurrenceValue = {};
    setRecurrenceRepetition(e.target.value);
    if (e.target.value !== 'NONE') {
      recurrenceValue.repeatingEvery = e.target.value;
      recurrenceValue.numberOfOccurences = 1;
      recurrenceValue.bysetpos = 0;
      recurrenceValue.byWeekDay = '';
      recurrenceValue.monthlyDayType = '';
      recurrenceValue.byMonthDay = 1;
      recurrenceValue.weekDays = [];
      if (e.target.value === 'MONTHLY') {
        recurrenceValue.bysetpos = 1;
        recurrenceValue.byWeekDay = 'MO';
        recurrenceValue.monthlyDayType = 'monthlyWeekDay';
      }

      if(value.recurringDtstart) {
        value.recurringDtstart = props.selectedEvent.startDate;
      }

      if(value.recurringUntil) {
        value.recurringUntil = props.selectedEvent.endDate;
      }

      setRecurrence(recurrenceValue);
    }

    validateRecurrence();
  };

  const handleByWeekDay = (e) => {
    setByWeekDay(e.target.value);
    setRecurrence(existingValues => ({
      ...existingValues,
      byWeekDay: e.target.value
    }));

    validateRecurrence();
  };

  const handleBysetpos = (e) => {
    setBysetpos(e.target.value);
    setRecurrence(existingValues => ({
      ...existingValues,
      bysetpos: parseInt(e.target.value)
    }));

    validateRecurrence();
  };

  const handleWeekdayChange = (event) => {
    const index = recurrence.weekDays.indexOf(event.target.value);
    let selectedWeekDays = [];
    if (index === -1) {
      selectedWeekDays = [...recurrence.weekDays, event.target.value];
    } else {
      selectedWeekDays = recurrence.weekDays.filter((weekDay) => weekDay !== event.target.value);
    }

    setRecurrence(existingValues => ({
      ...existingValues,
      weekDays: selectedWeekDays
    }));

    setRefresher(!refresher);
    validateRecurrence();
  };

  const validateRecurrence = () => {

    // TODO : Validate and only set edited if all the recurrence values are valid
    if (!Utils.isNull(props.selectedEvent)) {
      setEdited(true);
    }
  };

  const validateStartAndEndtime = () => {
    const checkStartDate = recurrenceRepetition !== 'NONE' ?  value.recurringDtstart : value.startDate;
    const endStartDate = recurrenceRepetition !== 'NONE' ?  value.recurringUntil : value.endDate;

    const meetingStartDateTime = !Utils.isNull(checkStartDate) && !Utils.isNull(value.startTime) ?
      moment(Utils.getFormattedDate(checkStartDate) + " " + value.startTime.toLocaleTimeString()) : null;
    const meetingEndDateTime = !Utils.isNull(endStartDate) && !Utils.isNull(value.endTime) ?
      moment(Utils.getFormattedDate(endStartDate) + " " + value.endTime.toLocaleTimeString()) : null;

    return meetingStartDateTime !== null && meetingEndDateTime !== null && meetingStartDateTime.isBefore(meetingEndDateTime);
  };

  const JoinAction = () => {
    if (
      !Utils.isNull(props.selectedEvent) &&
      !Utils.isNull(props.selectedEvent.id) &&
      !Utils.isStringEmpty(props.selectedEvent.id)
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
          <div style={{marginRight: '4px'}}>
            {
              !appManager.get('CURRENT_MEETING') && !lapsed && !edited &&
              <Button
                variant={'contained'}
                size="large"
                color={'primary'}
                onClick={(e) => handleJoin(e)}
              >
                JOIN
              </Button>
            }
          </div>
        </div>
      );
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
          <Button variant={'text'} size="large" onClick={(e) => handleClose(e)}>
            CLOSE
          </Button>
          <div style={{marginRight: '4px'}}>
            <Button
              onClick={(e) => handleAdd()}
              variant={'contained'}
              size="large"
              color={'primary'}
            >
              SEND
            </Button>
          </div>
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
        <div style={{marginRight: '4px'}}>
          {/*<Button
            variant={'contained'}
            size="large"
            color={'primary'}
            onClick={(e) => handleClose(e)}
          >
            RESPOND
          </Button>*/}
        </div>
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
        {
          !lapsed &&
          <div style={{marginRight: '4px'}}>
            <Button
              variant={'text'}
              size="large"
              onClick={(e) => handleDelete(e)}
            >
              CANCEL MEETING
            </Button>
          </div>
        }
        <Button variant={'text'} size="large" onClick={(e) => handleClose(e)}>
          CLOSE
        </Button>
        {
          edited ? (
            <div style={{marginRight: '4px'}}>
              <Button
                variant={'contained'}
                size="large"
                color={'primary'}
                onClick={(e) => handleUpdate(e)}
              >
                SEND UPDATE
              </Button>
            </div>
          ) : null
        }
      </div>
    );
  };

  return (
    value && (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: '32px',
          backgroundColor: '#FFFFFF',
          marginTop: '2px',
        }}
      >
        {
          savePromiseContext &&
          <AlertDialog title={'Warning'}
                       message={'You have selected attendees outside your organisation. Would you like to proceed and share the attached files?'}
                       onLeft={() => {
                         savePromiseContext.reject();
                         setSavePromiseContext(null);
                       }}
                       onRight={() => {
                         setSavePromiseContext(null);
                         savePromiseContext.resolve(savePromiseContext.data)
                       }}
                       showLeft={true}
                       showRight={true}
                       btnTextLeft={'CANCEL'}
                       btnTextRight={'PROCEED'}
          />
        }
        {
          invalidAttendeesPromiseContext &&
          <AlertDialog title={'Warning'}
                       message={'You have selected attendees with invalid email addresses. They will be excluded from this email if you proceed. Would you like to proceed?'}
                       onLeft={() => {
                         invalidAttendeesPromiseContext.reject();
                         setInvalidAttendeesPromiseContext(null);
                       }}
                       onRight={() => {
                         setInvalidAttendeesPromiseContext(null);
                         invalidAttendeesPromiseContext.resolve(invalidAttendeesPromiseContext.data)
                       }}
                       showLeft={true}
                       showRight={true}
                       btnTextLeft={'CANCEL'}
                       btnTextRight={'PROCEED'}

          />
        }
        {
          cancelPromiseContext &&
          <AlertDialog title={'Warning'}
                       message={'Are you sure you want to cancel the selected meeting?'}
                       onLeft={() => {
                         cancelPromiseContext.reject();
                         setCancelPromiseContext(null);
                       }}
                       onRight={() => {
                         cancelPromiseContext.resolve(cancelPromiseContext.data);
                         setCancelPromiseContext(null);
                       }}
                       showLeft={true}
                       showRight={true}
                       btnTextLeft={'NO'}
                       btnTextRight={'YES'}
          />
        }
        <h5 className="modal-title">
          {selectedMeeting &&
          selectedMeeting.title &&
          selectedMeeting.title.length
            ? ''
            : 'Add'}{' '}
          Meeting
        </h5>
        <div style={{width: '80%'}}>
          <Form>
            <div className="d-flex mb-1">
              <JoinAction/>
            </div>
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
                  control={<Radio disabled={readOnly}/>}
                  label="Private"
                />
                <FormControlLabel
                  value="PUBLIC"
                  control={<Radio disabled={readOnly}/>}
                  label="Public"
                />
              </RadioGroup>
            </FormControl>
            <div style={{margin: '0'}}>
              <FormControlLabel control={
                <Switch
                  disabled={readOnly}
                  checked={value.askToJoin}
                  value={value.askToJoin}
                  color="primary"
                  onChange={(e, val) => {
                    handleFormValueChange(val, 'askToJoin', true);
                  }}
                />
              } label="Auto permit"/>
            </div>
            <div style={{margin: '0'}}>
              <div className={'col-*-*'} style={{width: '20%'}}>
                <SelectItem
                  select
                  style={{width: '100%'}}
                  id="setEventRecurrenceSelect"
                  value={recurrenceRepetition}
                  variant={'outlined'}
                  margin="dense"
                  size="small"
                  label="Repeats"
                  disabled={readOnly}
                  valueChangeHandler={handleEventRecurring}
                  options={recurrenceOptions}
                />
              </div>
              {
                recurrenceRepetition !== 'NONE' &&
                <div style={{width: '100%'}}>
                  <div className={'row no-margin'}>
                    <div className={'col-*-*'}>
                      <DatePicker
                        label="From"
                        id="recurringDtstart"
                        disabled={readOnly}
                        hasError={errors.recurringDtstart}
                        value={value.recurringDtstart}
                        required={true}
                        valueChangeHandler={(date, id) =>
                          handleFormValueChange(date, id, true)
                        }
                        errorMessage={
                          'A recurring start date is required. Please select a value'
                        }
                      />
                    </div>
                    <div className={'col-*-*'}
                         style={{paddingLeft: '8px'}}>
                      <CustomTimePicker
                        label={"At"}
                        disabled={readOnly}
                        id="startTime"
                        hasError={errors.startTime}
                        value={value.startTime}
                        required={true}
                        valueChangeHandler={(date, id) =>
                          handleFormValueChange(date, id, true)
                        }
                        errorMessage={
                          'A recurring end time is required. Please select a value'
                        }
                      />
                    </div>
                  </div>
                  <div className={'row no-margin'}>
                    <div style={{marginRight: '8px'}}>
                      <TextField
                        style={{width: '100%'}}
                        disabled={readOnly}
                        label="Repeat every"
                        id="numberOfOccurencesId"
                        type={'number'}
                        value={recurrence.numberOfOccurences}
                        required={true}
                        inputProps={{ min: 0 }}
                        valueChangeHandler={(e) => {
                          console.log(e.target.value);
                          if (e.target.value > 0 && e.target.value < 100) {
                            setRecurrence(existingValues => ({
                              ...existingValues,
                              numberOfOccurences: e.target.value
                            }));

                            validateRecurrence();
                          }
                        }}
                        errorMessage={
                          'Specify number of occurences required. Please enter a number'
                        }
                      />
                    </div>
                    <div>
                      <SelectItem
                        style={{width: '100%'}}
                        labelId="event-recurrence-label"
                        id="setEventRecurrenceSelect"
                        value={recurrenceRepetition}
                        disabled={true}
                        valueChangeHandler={handleEventRecurring}
                        options={recurrenceIntervalOptions}
                      />
                    </div>
                    {recurrenceRepetition === 'WEEKLY' ? (
                      <div className={'col-*-*'} style={{margin: '8px 0 0 8px'}}>
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('SU')}
                                onChange={handleWeekdayChange}
                                value={'SU'}
                              />
                            }
                            label="Sun"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('MO')}
                                onChange={handleWeekdayChange}
                                value={'MO'}
                              />
                            }
                            label="Mon"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('TU')}
                                onChange={handleWeekdayChange}
                                value={'TU'}
                              />
                            }
                            label="Tue"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('WE')}
                                onChange={handleWeekdayChange}
                                value={'WE'}
                              />
                            }
                            label="Wed"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('TH')}
                                onChange={handleWeekdayChange}
                                value={'TH'}
                              />
                            }
                            label="Thur"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('FR')}
                                onChange={handleWeekdayChange}
                                value={'FR'}
                              />
                            }
                            label="Fri"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={recurrence.weekDays.includes('SA')}
                                onChange={handleWeekdayChange}
                                value={'SA'}
                              />
                            }
                            label="Sat"
                          />
                        </FormGroup>
                      </div>
                    ) : null}
                  </div>
                  {recurrenceRepetition === 'MONTHLY' ? (
                    <div className={'col-*-*'}>
                      <RadioGroup
                        aria-labelledby="radio-monthly-day-type-label"
                        row
                        disabled={readOnly}
                        value={recurrence.monthlyDayType}
                        name="radio-buttons-group"
                        onChange={(e, val) => {
                          setRecurrence(existingValues => ({
                            ...existingValues,
                            monthlyDayType: e.target.value
                          }));

                          validateRecurrence();
                          setRefresher(!refresher);
                        }}
                      >
                        <div className={'row no-margin'}>
                          <div className={'col-*-*'}>
                            <FormControlLabel
                              value="monthlyCalendarDay"
                              control={<Radio disabled={readOnly}/>}
                              label="On day"
                            />
                          </div>
                          <div className={'col-*-*'} style={{marginRight: '8px'}}>
                            <TextField
                              style={{width: '100%'}}
                              disabled={recurrence.monthlyDayType !== 'monthlyCalendarDay' || readOnly}
                              label="On day"
                              id="byMonthDay"
                              type={'number'}
                              value={recurrence.byMonthDay}
                              required={true}
                              valueChangeHandler={(e) => {
                                setRecurrence(existingValues => ({
                                  ...existingValues,
                                  byMonthDay: e.target.value
                                }));

                                validateRecurrence();
                              }}
                              errorMessage={'Please enter a number'}
                            />
                          </div>
                        </div>
                        <div className={'row no-margin'}>
                          <div className={'col-*-*'}>
                            <FormControlLabel
                              value="monthlyWeekDay"
                              control={<Radio disabled={readOnly}/>}
                              label="On the"
                            />
                          </div>
                          <div className={'col-*-*'} style={{marginRight: '8px'}}>
                            <SelectItem
                              style={{width: '100%'}}
                              labelId="bysetpos-label"
                              id="bySetPosSelect"
                              value={bysetpos}
                              disabled={recurrence.monthlyDayType !== 'monthlyWeekDay' || readOnly}
                              valueChangeHandler={handleBysetpos}
                              options={bySetPosOptions}
                            />
                          </div>
                          <div className={'col-*-*'}>
                            <SelectItem
                              style={{width: '100%'}}
                              labelId="byWeek-day-label"
                              id="byWeekDaySelect"
                              value={byWeekDay}
                              disabled={recurrence.monthlyDayType !== 'monthlyWeekDay' || readOnly}
                              valueChangeHandler={handleByWeekDay}
                              options={byWeekDayOptions}
                            />
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  ) : null}

                  <div className={'row no-margin'}>
                    <div className={'col-*-*'}>
                      <DatePicker
                        label="Until"
                        id="recurringUntil"
                        disabled={readOnly}
                        hasError={errors.recurringUntil}
                        value={value.recurringUntil}
                        required={true}
                        valueChangeHandler={(date, id) =>
                          handleFormValueChange(date, id, true)
                        }
                        errorMessage={
                          'A recurring end date is required. Please select a value'
                        }
                      />
                    </div>
                    <div className={'col-*-*'}
                         style={{paddingLeft: '8px'}}>
                      <CustomTimePicker
                        label={"At"}
                        disabled={readOnly}
                        id="endTime"
                        hasError={errors.endTime}
                        value={value.endTime}
                        required={true}
                        valueChangeHandler={(date, id) =>
                          handleFormValueChange(date, id, true)
                        }
                        errorMessage={() => {
                          return Utils.isNull(value.endTime) ? 'A recurring end time is required' : 'Recurring end should not be in the past'
                        }}
                      />
                    </div>
                  </div>
                </div>
              }
            </div>
            <div>
              <div>
                <div className={'row no-margin'}>
                  {
                    (!Utils.isStringEmpty(props.selectedEvent.id) || recurrenceRepetition === 'NONE') &&
                    <Fragment>
                      <div className={'col-*-*'}>
                        <DatePicker
                          label={'Start date'}
                          id="startDate"
                          disabled={readOnly || recurrenceRepetition !== 'NONE'}
                          hasError={errors.startDate}
                          value={value.startDate}
                          required={true}
                          valueChangeHandler={(date, id) =>
                            handleFormValueChange(date, id, true)
                          }
                          errorMessage={() => {
                            return Utils.isNull(value.startDate) ? 'A start date is required' : 'Start date should not be in the past'
                          }}
                        />
                      </div>
                      {
                        recurrenceRepetition === 'NONE' &&
                        <div className={'col-*-*'}
                             style={{paddingLeft: !Utils.isStringEmpty(props.selectedEvent.id) || recurrenceRepetition === 'NONE' ? '8px' : '0'}}>
                          <CustomTimePicker
                            label={"Start time"}
                            id="startTime"
                            disabled={readOnly}
                            hasError={errors.startTime}
                            value={value.startTime}
                            required={true}
                            valueChangeHandler={(date, id) =>
                              handleFormValueChange(date, id, true)
                            }
                            errorMessage={() => {
                              return Utils.isNull(value.startTime) ? 'A start time is required' : 'Start time should not be in the past'
                            }}
                          />
                        </div>
                      }
                    </Fragment>
                  }
                </div>
              </div>
              <div>
                <div className={'row no-margin'}>
                  {
                    (!Utils.isStringEmpty(props.selectedEvent.id) || recurrenceRepetition === 'NONE') &&
                    <Fragment>
                      <div className={'col-*-*'}>
                        <DatePicker
                          label={'End date'}
                          disabled={readOnly || recurrenceRepetition !== 'NONE'}
                          id="endDate"
                          hasError={errors.endDate}
                          value={value.endDate}
                          required={recurrenceRepetition !== 'NONE'}
                          valueChangeHandler={(date, id) =>
                            handleFormValueChange(date, id, true)
                          }
                          errorMessage={() => {
                            return Utils.isNull(value.endDate) ? 'An end date is required' : !validateStartAndEndtime() ?
                              'The end date must be after the start time' : 'End date should not be in the past'
                          }}
                        />
                      </div>
                      {
                        recurrenceRepetition === 'NONE' &&
                        <div className={'col-*-*'}
                             style={{paddingLeft: !Utils.isStringEmpty(props.selectedEvent.id) || recurrenceRepetition === 'NONE' ? '8px' : '0'}}>
                          <CustomTimePicker
                            label={"End time"}
                            disabled={readOnly || recurrenceRepetition !== 'NONE'}
                            id="endTime"
                            hasError={errors.endTime}
                            value={value.endTime}
                            required={true}
                            valueChangeHandler={(date, id) =>
                              handleFormValueChange(date, id, true)
                            }
                            errorMessage={() => {
                              return Utils.isNull(value.endTime) ? 'A end time is required' : !validateStartAndEndtime() ?
                                'The end time must be after the start time' : 'End time should not be in the past'
                            }}
                          />
                        </div>
                      }
                    </Fragment>
                  }
                </div>
              </div>
            </div>
            <div style={{marginTop: '8px'}}>
              <AutoComplete
                id="attendees"
                label={'Attendees'}
                disabled={readOnly}
                invalidText={'invalid attendee'}
                value={value.attendees}
                hasError={errors.attendees}
                errorMessage={
                  'At least one attendees required'
                }
                multiple={true}
                showImages={true}
                searchAttribute={'name'}
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
                optionsUrl={`${appManager.getAPIHost()}/api/v1/auth/search`}
              />
            </div>

            {
              !readOnly && !Utils.isStringEmpty(props.selectedEvent.id) &&
              <div style={{marginTop: '8px'}}>
                <AutoComplete
                  id="host"
                  label={'Host'}
                  invalidText={'invalid attendee'}
                  value={newHostAttendee}
                  multiple={true}
                  showImages={true}
                  searchAttribute={'emailAddress'}
                  validationRegex={/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/}
                  valueChangeHandler={(value, id) => {
                    setNewHostAttendee([].concat(value[1]));
                    handleFormValueChange(value, id, false);
                  }}
                  optionsData={value.attendees}
                />
              </div>
            }

            <div style={{marginTop: '12px'}}>
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
                optionsUrl={`${appManager.getAPIHost()}/api/v1/location/search`}
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
            {/*<div>
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
            </div>*/}
            <div className="d-flex mb-1">
              <EventActions/>
            </div>
          </Form>
        </div>
      </div>
    )
  );
};

export default Meeting;
