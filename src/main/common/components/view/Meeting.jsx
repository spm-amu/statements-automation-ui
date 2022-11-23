import React, {useState} from 'react';
import {X} from 'react-feather';
import {components} from 'react-select';
import {Form} from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import TimePicker from '../customInput/TimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Files from '../customInput/Files';
import Utils from '../../Utils';
import Avatar from '../avatar';
import {get, host, post} from '../../service/RestService';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import {useNavigate} from 'react-router-dom';
import ModalComponent from '../customInput/Modal';
import {Checkbox, MenuItem, Select} from '@material-ui/core';
import EventMessageComponent from '../customInput/EventMessage';
import appManager from "../../../common/service/AppManager";
import AlertDialog from "../AlertDialog";

const options = ['NONE', 'TEST'];

const Meeting = (props) => {
  const now = new Date();
  const [url, setUrl] = useState('');
  const [hostAttendee, setHostAttendee] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const {selectedEvent: selectedMeeting} = props;
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [edited, setEdited] = useState(false);
  const [eventRecurrence, setEventRecurrence] = React.useState('NONE');
  const [repeatingEvery, setRepeatingEvery] = React.useState('');
  const [numberOfOccurences, setNumberOfOccurences] = React.useState(1);
  const [bysetpos, setBysetpos] = React.useState(0);
  const [byWeekDay, setByWeekDay] = React.useState('');
  const [monthlyDayType, setMonthlyDayType] = React.useState('monthlyWeekDay');
  const [byMonthDay, setByMonthDay] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [weekDays, setWeekDays] = useState([]);
  const [recurrenceChecked, setRecurrenceChecked] = useState(false);
  const [savePromiseContext, setSavePromiseContext] = useState(null);

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

    if (props.selectedEvent.recurringFreq !== null) {
      setRepeatingEvery(props.selectedEvent.recurringFreq);
      setEventRecurrence(props.selectedEvent.recurringFreq);
      setNumberOfOccurences(props.selectedEvent.recurringInterval);

      if (props.selectedEvent.recurringFreq === 'MONTHLY') {
        if (props.selectedEvent.recurringBymonthday !== null) {
          setMonthlyDayType("monthlyCalendarDay");
          setByMonthDay(props.selectedEvent.recurringBymonthday);
        } else {
          setMonthlyDayType("monthlyWeekDay");
          setBysetpos(props.selectedEvent.recurringBysetpos);
          setByWeekDay(props.selectedEvent.recurringByweekday[0]);
        }
      } else if (props.selectedEvent.recurringFreq === 'WEEKLY') {
        setWeekDays(props.selectedEvent.recurringByweekday);
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
        recurringStartDate: now,
        startTime: now,
        endDate:
          !Utils.isNull(props.selectedEvent) &&
          !Utils.isNull(props.selectedEvent.endDate)
            ? props.selectedEvent.endDate
            : now,
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
      let userDetails = appManager.getUserDetails();
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
      schedule: {
        startDate: Utils.getFormattedDate(value.startDate),
        startTime: value.startTime.toLocaleTimeString('it-IT'),
        endDate: Utils.getFormattedDate(value.endDate),
        endTime: value.endTime.toLocaleTimeString('it-IT')
      },
    };

    if (eventRecurrence !== 'NONE') {

      let recEndDate = new Date(Utils.getFormattedDate(value.endDate));
      recEndDate.setDate(recEndDate.getDate() + 1);

      eventData.schedule.rrule = {
        freq: eventRecurrence,
        interval: numberOfOccurences,
        dtstart: new Date(Utils.getFormattedDate(value.startDate) + " " + value.startTime.toLocaleTimeString('it-IT')),
        until: recEndDate
      };

      if (eventRecurrence === 'WEEKLY') {
        let occurs = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];

        if (weekDays && weekDays.length > 0) {
          occurs = weekDays;
        }

        eventData.schedule.rrule.byweekday = occurs;
      }

      console.log("Submitting => monthlyDayType", monthlyDayType);
      if (eventRecurrence === 'MONTHLY') {
        eventData.schedule.rrule.monthlyDayType = monthlyDayType;
        if (monthlyDayType === 'monthlyCalendarDay') {
          eventData.schedule.rrule.bymonthday = byMonthDay;
        } else {
          eventData.schedule.rrule.bysetpos = bysetpos;
          eventData.schedule.rrule.byweekday = [byWeekDay];
        }
      }
    }

    console.log('DATA: ', eventData);

    return eventData;
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

      saveMeetingObject(_hostAttendee).then((data) => {
        post(
          `${host}/api/v1/meeting/${isUpdate ? 'update' : 'create'}`,
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

  const saveMeetingObject = (hostAttendee) => {
    return new Promise((resolve, reject) => {

      let data = createMeetingObject(hostAttendee);
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
      (e) => {
      },
      "The meeting has been cancelled successfully"
    );
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

  const handleEventRecurringClose = () => {
    setOpen(false);
  };

  const handleEventRecurringSave = () => {
    setOpen(false);
  };

  const handleEventRecurring = (e) => {
    setEventRecurrence(e.target.value);
    if (e.target.value !== 'NONE') {
      setRepeatingEvery(e.target.value);
      setNumberOfOccurences(1);
      setOpen(true);
      setBysetpos(0);
      setByWeekDay('');
      setMonthlyDayType('');
      setByMonthDay(1);
      setWeekDays([]);
      if (e.target.value === 'MONTHLY') {
        setBysetpos(1);
        setByWeekDay('MO');
        setMonthlyDayType('monthlyWeekDay');
      }
    }
  };

  const handleByWeekDay = (e) => {
    setByWeekDay(e.target.value);
  };

  const handleBysetpos = (e) => {
    setBysetpos(parseInt(e.target.value));
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
        {
          !appManager.get('CURRENT_MEETING') &&
          <Button
            variant={'contained'}
            size="large"
            color={'primary'}
            onClick={(e) => handleJoin(e)}
          >
            JOIN
          </Button>
        }
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
        <div style={{marginRight: '4px'}}>
          {
            !appManager.get('CURRENT_MEETING') &&
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
        {edited ? (
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
        ) : null}
        <div style={{marginRight: '4px'}}>
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
    <X className="cursor-pointer" size={15} onClick={(e) => handleClose(e)}/>
  );

  const onRecurrenceChecked = () => {
    console.log('recurrenceChecked', recurrenceChecked);
    setEventRecurrence('NONE');
    setRecurrenceChecked(!recurrenceChecked);
  };

  const setRecurrentBody = (
    value &&
    <div style={{width: '100%'}}>
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
          <br/>
        </div>
        <div className={'col-*-*'}>
          <Select
            style={{width: '100%'}}
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
          <br/>
          <br/>
        </div>

        {eventRecurrence === 'WEEKLY' ? (
          <div className={'col-*-*'}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={weekDays.includes('MO')}
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
                    checked={weekDays.includes('TU')}
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
                    checked={weekDays.includes('WE')}
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
                    checked={weekDays.includes('TH')}
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
                    checked={weekDays.includes('FR')}
                    onChange={handleWeekdayChange}
                    value={'FR'}
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
            setMonthlyDayType(val);
          }}
        >
          <div className={'row no-margin'}>
            <div className={'col-*-*'}>
              <FormControlLabel
                value="monthlyCalendarDay"
                control={<Radio/>}
                label="On day"
              />
            </div>

            <div className={'col-*-*'}>
              <TextField
                disabled={monthlyDayType !== 'monthlyCalendarDay'}
                label="On day"
                id="byMonthDay"
                type={'number'}
                value={byMonthDay}
                required={true}
                valueChangeHandler={(e) => {
                  setByMonthDay(e.target.value);
                }}
                errorMessage={'Please enter a number'}
              />
              <br/>
            </div>
          </div>

          <div className={'row no-margin'}>
            <div className={'col-*-*'}>
              <FormControlLabel
                value="monthlyWeekDay"
                control={<Radio/>}
                label="On the"
              />
            </div>

            <div className={'col-*-*'}>
              <Select
                style={{width: '100%'}}
                labelId="bysetpos-label"
                id="bySetPosSelect"
                value={bysetpos}
                label="On the"
                disabled={monthlyDayType !== 'monthlyWeekDay'}
                onChange={handleBysetpos}
              >
                <MenuItem value={1}>First</MenuItem>
                <MenuItem value={2}>Second</MenuItem>
                <MenuItem value={3}>Third</MenuItem>
                <MenuItem value={4}>Fourth</MenuItem>
                <MenuItem value={-1}>Last</MenuItem>
              </Select>
            </div>

            <div className={'col-*-*'}>
              <p>&nbsp;&nbsp;&nbsp;</p>
            </div>

            <div className={'col-*-*'}>
              <Select
                style={{width: '100%'}}
                labelId="byWeek-day-label"
                id="byWeekDaySelect"
                value={byWeekDay}
                label="On the"
                disabled={monthlyDayType !== 'monthlyWeekDay'}
                onChange={handleByWeekDay}
              >
                <MenuItem value={'SU'}>Sunday</MenuItem>
                <MenuItem value={'MO'}>Monday</MenuItem>
                <MenuItem value={'TU'}>Tuesday</MenuItem>
                <MenuItem value={'WE'}>Wednesday</MenuItem>
                <MenuItem value={'TH'}>Thursday</MenuItem>
                <MenuItem value={'FR'}>Friday</MenuItem>
                <MenuItem value={'SA'}>Saturday</MenuItem>
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
            byMonthDay={byMonthDay}
            byWeekDay={byWeekDay}
            bysetpos={bysetpos}
            recurringEndDate={value && value.endDate ? value.endDate : null}
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

        <div style={{width: '80%'}}>
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

            <div>
              <div>
                <div className={'row no-margin'}>
                  <div className={'col-*-*'}>
                    <DatePicker
                      label={eventRecurrence !== 'NONE' ? 'Recurring Start date' : 'Start date'}
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
                  <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
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
                      label={eventRecurrence !== 'NONE' ? 'Recurring End date' : 'End date'}
                      disabled={readOnly}
                      id="endDate"
                      hasError={errors.endDate}
                      value={value.endDate}
                      required={eventRecurrence === 'NONE'}
                      valueChangeHandler={(date, id) =>
                        handleFormValueChange(date, id, true)
                      }
                      errorMessage={
                        'An end date is required. Please select a value'
                      }
                    />
                  </div>

                  <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
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

            <div style={{marginTop: '8px'}}>
              <div className={'row no-margin'}>
                <div className={'col-*-*'} style={{width: '20%'}}>
                  <Select
                    style={{width: '100%'}}
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

                {
                  eventRecurrence === 'MONTHLY' ? (
                    <div className={'col-*-*'}>
                      <EventMessageComponent
                        recurringType={eventRecurrence}
                        numberOfOccurences={numberOfOccurences}
                        monthlyDayType={monthlyDayType}
                        byMonthDay={byMonthDay}
                        byWeekDay={byWeekDay}
                        bysetpos={bysetpos}
                        recurringEndDate={value && value.endDate ? value.endDate : null}
                      />
                    </div>) : null
                }
              </div>
            </div>

            <div style={{marginTop: '8px'}}>
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
