// ** React Imports
import {useState} from 'react';
// ** Third Party Components
import {X} from 'react-feather';
import Flatpickr from 'react-flatpickr';
import Select, {components} from 'react-select' // eslint-disable-line
// ** Reactstrap Imports
import {Form, Label} from 'reactstrap';

import Button from '@material-ui/core/Button';
import CustomInput from '../customInput/CustomInput';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import TimePicker from '../customInput/TimePicker';
import AutoComplete from '../customInput/AutoComplete';
// ** Avatar Images
import img1 from '../../assets/img/avatars/1-small.png';
import img2 from '../../assets/img/avatars/1-small.png';
import img3 from '../../assets/img/avatars/1-small.png';
import img4 from '../../assets/img/avatars/1-small.png';
import img5 from '../../assets/img/avatars/1-small.png';
import img6 from '../../assets/img/avatars/1-small.png';
import Utils from '../../Utils';
import Avatar from '../avatar';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';

// ** Custom Components

const Meeting = (props) => {

  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [guests, setGuests] = useState({});
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [endPicker, setEndPicker] = useState(new Date());
  const [startPicker, setStartPicker] = useState(new Date());
  const {selectedEvent: selectedMeeting} = props;
  const [value] = useState({});
  const [errors, setErrors] = useState({});

  const guestsOptions = [
    {
      identifier: 'GabrielleRobertson',
      name: 'Donna Frank',
      optional: false,
      avatar: img1,
    },
    {
      identifier: 'GabrielleRobertson',
      name: 'Jane Foster',
      optional: false,
      avatar: img2,
    },
    {
      identifier: 'GabrielleRobertson',
      name: 'Gabrielle Robertson',
      optional: false,
      avatar: img3,
    },
    {
      identifier: 'Lori Spears',
      name: 'Lori Spears',
      optional: false,
      avatar: img4,
    },
    {
      identifier: 'Sandy Vega',
      name: 'Sandy Vega',
      optional: false,
      avatar: img5,
    },
    {
      identifier: 'Cheryl May',
      name: 'Cheryl May',
      optional: false,
      avatar: img6,
    },
  ];

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

  const handleAdd = () => {

  };

  const handleClose = () => {

  };

  const handleUpdate = () => {

  };

  const formValueChangeHandler = (e) => {
    let inputValue = e.target.value;

    if (e.target.id === 'title') {
      if (Utils.isNull(inputValue) || Utils.isStringEmpty(inputValue)) {
        value[e.target.id] = null;
        setErrors({...errors, ['title']: true});
        return;
      }
    }

    setErrors({...errors, [e.target.id]: false});
    value[e.target.id] = inputValue;
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (
      Utils.isNull(selectedMeeting) ||
      (!Utils.isNull(selectedMeeting) && !selectedMeeting.title.length)
    ) {
      return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'right', margin: '16px 0'}}>
          <div style={{marginRight: '4px'}}>
            <Button
              onClick={handleAdd()}
              variant={'contained'}
              size="large"
              color={'primary'}>
              SEND
            </Button>
          </div>
          <Button
            variant={'text'}
            size="large"
            block
            onClick={(e) => handleClose(e)}
          >
            CLOSE
          </Button>
        </div>
      );
    }
    return (
      <>
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
        <div style={{marginRight: '4px'}}>
          <Button
            variant={'text'}
            size="large"
            block
            onClick={(e) => handleDelete(e)}
          >
            CANCEL MEETING
          </Button>
        </div>
        <Button
          variant={'contained'}
          size="large"
          color={'primary'}
          onClick={(e) => handleUpdate(e)}
        >
          JOIN
        </Button>
      </>
    );
  };

  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={(e) => handleClose(e)}/>
  );

  return (
    <Form>
      <div>
        <TextField
          label="Title"
          id="title"
          hasError={errors.title}
          required={true}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={'A meeting title is required. Please enter a value'}
        />
      </div>
      <div>
        <div className={'row no-margin'}>
          <div className={'col-*-*'}>
            <DatePicker
              label="Start date"
              id="startDate"
              hasError={errors.startDate}
              value={new Date()}
              required={true}
              valueChangeHandler={(e) => formValueChangeHandler(e)}
              errorMessage={'A start date is required. Please select a value'}
            />
          </div>
          <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
            <TimePicker
              label="Start time"
              id="startTime"
              hasError={errors.startDate}
              value={new Date()}
              required={true}
              valueChangeHandler={(e) => formValueChangeHandler(e)}
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
              value={new Date()}
              required={true}
              valueChangeHandler={(e) => formValueChangeHandler(e)}
              errorMessage={'An end date is required. Please select a value'}
            />
          </div>
          <div className={'col-*-*'} style={{paddingLeft: '8px'}}>
            <TimePicker
              label="End time"
              id="endTime"
              hasError={errors.startDate}
              value={new Date()}
              required={true}
              valueChangeHandler={(e) => formValueChangeHandler(e)}
              errorMessage={'A end time is required. Please select a value'}
            />
          </div>
        </div>
      </div>
      <div style={{marginTop: '8px'}}>
        <AutoComplete
          label={'Attendees'}
          showImages={true}
        />
      </div>
      <div style={{marginTop: '12px'}}>
        <AutoComplete
          label={'Location'}
        />
      </div>
      <div>
        <TextField
          className={'text-area-wrapper'}
          label="Description"
          id="description"
          height={'150px'}
          multiline={true}
          hasError={errors.title}
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
