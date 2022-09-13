import {useState} from 'react';
import {X} from 'react-feather';
import {components} from 'react-select'
import {Form} from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import TimePicker from '../customInput/TimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Files from '../customInput/Files';
import Utils from '../../Utils';
import Avatar from '../avatar';
import {host, post, get} from "../../service/RestService";

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';

import {host} from "../../service/RestService";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

const Meeting = (props) => {

  const now = new Date();
  const [url, setUrl] = useState('');
  const {selectedEvent: selectedMeeting} = props;
  const [value] = useState(!Utils.isNull(props.selectedEvent) && !Utils.isNull(props.selectedEvent.id) && !Utils.isStringEmpty(props.selectedEvent.id) ? props.selectedEvent : {
    startDate: now,
    startTime: now,
    endDate: now,
    endTime: now,
    attendees: [],
    documents: [],
    privacyType: 'PRIVATE'
  });
  const [errors, setErrors] = useState({});
  const [edited, setEdited] = useState(false);

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

  const createMeetingObject = () => {
    return {
      id: value.id,
      title: value.title,
      attendees: value.attendees,
      documents: value.documents,
      location: value.location,
      description: value.description,
      privacyType: value.privacyType,
      schedule: {
        startDate: Utils.getFormattedDate(value.startDate),
        startTime: value.startTime.toLocaleTimeString(),
        endDate: Utils.getFormattedDate(value.endDate),
        endTime: value.endTime.toLocaleTimeString()
      }
    }
  };

  const handleAdd = () => {
    let errorState = {
      title: Utils.isNull(value.title),
      startDate: Utils.isNull(value.startDate),
      startTime: Utils.isNull(value.startTime),
      endDate: Utils.isNull(value.endDate),
      endTime: Utils.isNull(value.endTime)
    };

    setErrors(errorState);
    if (!hasErrors(errorState)) {
      post(`${host}/api/v1/meeting/${!Utils.isNull(props.selectedEvent) && !Utils.isNull(props.selectedEvent.id) && !Utils.isStringEmpty(props.selectedEvent.id) ? 'update' : 'create'}`, (response) => {
        props.refreshHandler();
        handleClose();
      }, (e) => {

      }, createMeetingObject());
    }
  };

  const handleClose = () => {
    props.closeHandler();
  };

  const handleUpdate = () => {
    handleAdd();
  };

  const handleDelete = (e) => {
    get(`${host}/api/v1/meeting/cancel/${value.id}`, (response) => {
      props.refreshHandler();
      handleClose();
    }, (e) => {
    })
  };

  const handleJoin = (e) => {
    props.joinHandler();
  };

  const validateField = (fieldId, fieldValue) => {
    if (Utils.isNull(fieldValue) || (typeof fieldValue === 'string' && Utils.isStringEmpty(fieldValue))) {
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

    console.log("\n\n\nVAL: ", value);
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };


  // ** Event Action buttons
  const EventActions = () => {
    if (
      Utils.isNull(props.selectedEvent) || Utils.isNull(props.selectedEvent.id) || Utils.isStringEmpty(props.selectedEvent.id)
    ) {
      return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'right', margin: '16px 0'}}>
          <div style={{marginRight: '4px'}}>
            <Button
              onClick={(e) => handleAdd()}
              variant={'contained'}
              size="large"
              color={'primary'}>
              SEND
            </Button>
          </div>
          <Button
            variant={'text'}
            size="large"
            onClick={(e) => handleClose(e)}
          >
            CLOSE
          </Button>
        </div>
      );
    }
    return (
      <div style={{width: '100%', display: 'flex', justifyContent: 'right', margin: '16px 0'}}>
        <div style={{marginRight: '4px'}}>
          <Button
            variant={'contained'}
            size="large"
            color={'primary'}
            onClick={(e) => handleJoin(e)}
          >
            JOIN
          </Button>
        </div>
        {
          edited ?
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
            :
            null
        }
        <div style={{marginRight: '4px'}}>
          <Button
            variant={'text'}
            size="large"
            onClick={(e) => handleDelete(e)}
          >
            CANCEL MEETING
          </Button>
        </div>
        <Button
          variant={'text'}
          size="large"
          onClick={(e) => handleClose(e)}
        >
          CLOSE
        </Button>
      </div>
    );
  };


  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={(e) => handleClose(e)}/>
  );

  return (
    <Form>
      <div>
        <Files
          readOnly={true}
          id={'documents'}
          value={value.documents}
          valueChangeHandler={(value, id) => handleFormValueChange(value, id, false)}
        />
      </div>
      <div>
        <TextField
          label="Title"
          id="title"
          hasError={errors.title}
          value={value.title}
          required={true}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={'A meeting title is required. Please enter a value'}
        />
      </div>
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          row
          defaultValue={value.privacyType}
          name="radio-buttons-group"
          onChange={(e, val) => {
            handleFormValueChange(val, "privacyType", true);
          }}
        >
          <FormControlLabel value="PRIVATE" control={<Radio/>} label="Private"/>
          <FormControlLabel value="PUBLIC" control={<Radio/>} label="Public"/>
        </RadioGroup>
      </FormControl>
      <div>
        <div className={'row no-margin'}>
          <div className={'col-*-*'}>
            <DatePicker
              label="Start date"
              id="startDate"
              hasError={errors.startDate}
              value={value.startDate}
              required={true}
              valueChangeHandler={(date, id) => handleFormValueChange(date, id, true)}
              errorMessage={'A start date is required. Please select a value'}
            />
          </div>
          <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
            <TimePicker
              label="Start time"
              id="startTime"
              hasError={errors.startTime}
              value={value.startTime}
              required={true}
              valueChangeHandler={(date, id) => handleFormValueChange(date, id, true)}
              errorMessage={'A start time is required. Please select a value'}
            />
          </div>
        </div>
      </div>
      <div>
        <div className={'row no-margin'}>
          <div className={'col-*-*'}>
            <DatePicker
              label="End date"
              id="endDate"
              hasError={errors.endDate}
              value={value.endDate}
              required={true}
              valueChangeHandler={(date, id) => handleFormValueChange(date, id, true)}
              errorMessage={'An end date is required. Please select a value'}
            />
          </div>
          <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
            <TimePicker
              label="End time"
              id="endTime"
              hasError={errors.endTime}
              value={value.endTime}
              required={true}
              valueChangeHandler={(date, id) => handleFormValueChange(date, id, true)}
              errorMessage={'A end time is required. Please select a value'}
            />
          </div>
        </div>
      </div>
      <div style={{marginTop: '8px'}}>
        <AutoComplete
          id="attendees"
          label={'Attendees'}
          invalidText={'invalid attendee'}
          value={value.attendees}
          multiple={true}
          showImages={true}
          searchAttribute={'emailAddress'}
          valueChangeHandler={(value, id) => handleFormValueChange(value, id, false)}
          optionsUrl={`${host}/api/v1/auth/search`}
        />
      </div>
      <div style={{marginTop: '12px'}}>
        <AutoComplete
          id="location"
          label={'Location'}
          value={value.location}
          searchAttribute={'name'}
          valueChangeHandler={(value, id) => handleFormValueChange(value, id, false)}
          optionsUrl={`${host}/api/v1/location/search`}
        />
      </div>
      <div>
        <TextField
          className={'text-area-wrapper'}
          label="Description"
          id="description"
          height={'150px'}
          multiline={true}
          hasError={errors.description}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
        />
      </div>
      <div className="d-flex mb-1">
        <EventActions/>
      </div>
    </Form>
  );
};

export default Meeting;
