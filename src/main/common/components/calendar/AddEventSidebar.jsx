// ** React Imports
import { Fragment, useState } from 'react';

// ** Custom Components

// ** Third Party Components
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import Flatpickr from 'react-flatpickr';
import Select, { components } from 'react-select' // eslint-disable-line
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useForm, Controller } from 'react-hook-form';

// ** Reactstrap Imports
import { Modal, ModalHeader, ModalBody, Label, Input, Form } from 'reactstrap';

import Button from '../RegularButton';
import CustomInput from '../customInput/CustomInput';

// ** Avatar Images
import img1 from '../../assets/img/avatars/1-small.png';
import img2 from '../../assets/img/avatars/1-small.png';
import img3 from '../../assets/img/avatars/1-small.png';
import img4 from '../../assets/img/avatars/1-small.png';
import img5 from '../../assets/img/avatars/1-small.png';
import img6 from '../../assets/img/avatars/1-small.png';
import Utils from '../../Utils';
import Avatar from '../avatar';

// ** Styles Imports
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';

const AddEventSidebar = (props) => {
  // ** Props
  const {
    open,
    store,
    dispatch,
    addEvent,
    calendarApi,
    selectEvent,
    removeEvent,
    updateEvent,
    refetchEvents,
    handleAddEventSidebar,
  } = props;

  // ** Vars & Hooks
  const { selectedEvent } = store;
  const {
    control,
    setError,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { title: '' },
  });

  // ** States
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [guests, setGuests] = useState({});
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [endPicker, setEndPicker] = useState(new Date());
  const [startPicker, setStartPicker] = useState(new Date());

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

  // ** Adds New Event
  const handleAddEvent = () => {
    const obj = {
      title: getValues('title'),
      description: desc.length ? desc : undefined,
      schedule: {
        startDate: Utils.getFormattedDate(startPicker),
        startTime: startPicker.toLocaleTimeString(),
        endDate: Utils.getFormattedDate(endPicker),
        endTime: endPicker.toLocaleTimeString(),
      },
      attendees: guests,
      location: {
        id: '4fae0a92-6de7-4750-8213-a19e724abd00',
      },
    };
    dispatch(addEvent(obj));
    refetchEvents();
    handleAddEventSidebar();
    toast.success('Event Added');
  };

  // ** Reset Input Values on Close
  const handleResetInputValues = () => {
    dispatch(selectEvent({}));
    setValue('title', '');
    setAllDay(false);
    setUrl('');
    setLocation('');
    setDesc('');
    setGuests({});
    setStartPicker(new Date());
    setEndPicker(new Date());
  };

  // ** Set sidebar fields
  const handleSelectedEvent = () => {
    if (!Utils.isObjEmpty(selectedEvent)) {
      setValue('title', selectedEvent.title || getValues('title'));
      setLocation(selectedEvent.extendedProps.location.name || location);
      setDesc(selectedEvent.extendedProps.description || desc);
      setGuests(selectedEvent.extendedProps.attendees || guests);
      setStartPicker(new Date(selectedEvent.start));
      setEndPicker(new Date(selectedEvent.end));
    }
  };

  // ** (UI) updateEventInCalendar
  const updateEventInCalendar = (
    updatedEventData,
    propsToUpdate,
    extendedPropsToUpdate
  ) => {
    const existingEvent = calendarApi.getEventById(updatedEventData.id);

    // ** Set event properties except date related
    // ? Docs: https://fullcalendar.io/docs/Event-setProp
    // ** dateRelatedProps => ['start', 'end', 'allDay']
    // ** eslint-disable-next-line no-plusplus
    for (let index = 0; index < propsToUpdate.length; index++) {
      const propName = propsToUpdate[index];
      existingEvent.setProp(propName, updatedEventData[propName]);
    }

    // ** Set date related props
    // ? Docs: https://fullcalendar.io/docs/Event-setDates
    existingEvent.setDates(
      new Date(updatedEventData.start),
      new Date(updatedEventData.end),
      {
        allDay: updatedEventData.allDay,
      }
    );

    // ** Set event's extendedProps
    // ? Docs: https://fullcalendar.io/docs/Event-setExtendedProp
    // ** eslint-disable-next-line no-plusplus
    for (let index = 0; index < extendedPropsToUpdate.length; index++) {
      const propName = extendedPropsToUpdate[index];
      existingEvent.setExtendedProp(
        propName,
        updatedEventData[propName]
      );
    }
  };

  // ** Updates Event in Store
  const handleUpdateEvent = () => {
    if (getValues('title').length) {

      console.log('selectedEvent: ', selectedEvent);

      const eventToUpdate = {
        id: selectedEvent.id,
        title: getValues('title'),
        description: desc,
        schedule: {
          startDate: Utils.getFormattedDate(startPicker),
          startTime: startPicker.toLocaleTimeString(),
          endDate: Utils.getFormattedDate(endPicker),
          endTime: endPicker.toLocaleTimeString(),
        },
        attendees: guests,
        location: {
          id: '4fae0a92-6de7-4750-8213-a19e724abd00',
        },
      };

      const propsToUpdate = ['id', 'title', 'url'];
      const extendedPropsToUpdate = [
        'description',
        'attendees',
        'location',
        'schedule',
      ];
      dispatch(updateEvent(eventToUpdate));
      updateEventInCalendar(eventToUpdate, propsToUpdate, extendedPropsToUpdate);

      handleAddEventSidebar();
      toast.success('Event Updated');
    } else {
      setError('title', {
        type: 'manual',
      });
    }
  };

  // ** (UI) removeEventInCalendar
  const removeEventInCalendar = (eventId) => {
    calendarApi.getEventById(eventId).remove();
  };

  const handleDeleteEvent = () => {
    dispatch(removeEvent(selectedEvent.id));
    removeEventInCalendar(selectedEvent.id);
    handleAddEventSidebar();
    toast.error('Event Removed');
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (
      Utils.isObjEmpty(selectedEvent) ||
      (!Utils.isObjEmpty(selectedEvent) && !selectedEvent.title.length)
    ) {
      return (
        <>
          <Button type="submit" color="rose" simple size="lg" block>
            SAVE
          </Button>

          <Button
            color="danger"
            simple
            size="lg"
            block
            onClick={handleAddEventSidebar}
          >
            CANCEL
          </Button>
        </>
      );
    }
    return (
      <>
        <Button
          type="submit"
          color="rose"
          simple
          size="lg"
          block
          onClick={handleUpdateEvent}
        >
          UPDATE
        </Button>

        <Button
          color="danger"
          simple
          size="lg"
          block
          onClick={handleDeleteEvent}
        >
          DELETE
        </Button>
      </>
    );
  };

  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={handleAddEventSidebar} />
  );

  return (
    <Modal
      isOpen={open}
      className="sidebar-lg"
      toggle={handleAddEventSidebar}
      onOpened={handleSelectedEvent}
      onClosed={handleResetInputValues}
      contentClassName="p-0 overflow-hidden"
      modalClassName="modal-slide-in event-sidebar"
    >
      <ModalHeader
        className="mb-1"
        toggle={handleAddEventSidebar}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">
          {selectedEvent && selectedEvent.title && selectedEvent.title.length
            ? 'Update'
            : 'Add'}{' '}
          Meeting
        </h5>
      </ModalHeader>
      <PerfectScrollbar options={{ wheelPropagation: false }}>
        <ModalBody className="flex-grow-1 pb-sm-0 pb-3">
          <Form
            onSubmit={handleSubmit((data) => {
              if (data.title.length) {
                if (Utils.isObjEmpty(errors)) {
                  if (
                    Utils.isObjEmpty(selectedEvent) ||
                    (!Utils.isObjEmpty(selectedEvent) &&
                      !selectedEvent.title.length)
                  ) {
                    handleAddEvent();
                  } else {
                    handleUpdateEvent();
                  }
                  handleAddEventSidebar();
                }
              } else {
                setError('title', {
                  type: 'manual',
                });
              }
            })}
          >
            <div className="mb-1">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    labelText="Title"
                    id="title"
                    formControlProps={{ fullWidth: true }}
                    success={errors.title && false}
                    error={errors.title && true}
                    inputProps={{ ...field }}
                  />
                )}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="startDate">
                Start Date
              </Label>
              <Flatpickr
                required
                id="startDate"
                name="startDate"
                className="form-control"
                onChange={(date) => setStartPicker(date[0])}
                value={startPicker}
                options={{
                  enableTime: allDay === false,
                  dateFormat: 'Y-m-d H:i',
                }}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="endDate">
                End Date
              </Label>
              <Flatpickr
                required
                id="endDate"
                // tag={Flatpickr}
                name="endDate"
                className="form-control"
                onChange={(date) => setEndPicker(date[0])}
                value={endPicker}
                options={{
                  enableTime: allDay === false,
                  dateFormat: 'Y-m-d H:i',
                }}
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="guests">
                Attendees
              </Label>
              <Select
                isMulti
                id="guests"
                className="react-select"
                classNamePrefix="select"
                isClearable={false}
                options={guestsOptions}
                theme={Utils.selectThemeColors}
                value={guests.length ? [...guests] : null}
                onChange={(data) => setGuests([...data])}
                components={{
                  Option: GuestsComponent,
                }}
              />
            </div>

            <div className="mb-1">
              <CustomInput
                labelText="Location"
                id="location"
                formControlProps={{ fullWidth: true }}
                inputProps={{
                  value: location,
                  onChange: (e) => {
                    setLocation(e.target.value);
                  },
                }}
              />
            </div>

            <div className="mb-1">
              <CustomInput
                labelText="Description"
                name="text"
                type="textarea"
                id="description"
                formControlProps={{ fullWidth: true }}
                inputProps={{
                  value: desc,
                  onChange: (e) => {
                    setDesc(e.target.value);
                  },
                }}
              />
            </div>
            <div className="d-flex mb-1">
              <EventActions />
            </div>
          </Form>
        </ModalBody>
      </PerfectScrollbar>
    </Modal>
  );
};

export default AddEventSidebar;
