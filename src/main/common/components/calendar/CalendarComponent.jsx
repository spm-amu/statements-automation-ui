import {memo, useEffect, useRef, useState} from 'react';

import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import {Menu, X} from 'react-feather';
import {Card, CardBody, Form, Modal, ModalBody, ModalHeader} from 'reactstrap';
import '../../assets/scss/app-calendar.scss';
import "./CalenderComponent.css";
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import Meeting from "../view/Meeting";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {host, get} from "../../service/RestService";
import Utils from '../../Utils';
import MeetingRoom from "../vc/MeetingRoom";

const eventTemplate = {
  id: '',
  title: '',
  start: '',
  end: '',
  allDay: false,
  extendedProps: {
    description: '',
    attendees: [
      {
        id: '',
        identifier: '',
        name: '',
        optional: false,
      },
    ],
    schedule: {
      id: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    },
    location: {
      id: '',
      name: '',
    },
  },
};

const CalendarComponent = (props) => {
  const {isRtl} = props;
  const [calendarApi, setCalendarApi] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mode, setMode] = useState('CALENDAR');
  const calendarRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (loading) {
      setLoading(false);
      loadEvents();
    }
  });

  const loadEvents = () => {
    get(`${host}/api/v1/meeting/fetchMeetings`, (response) => {
      setEvents(response);
    }, (e) => {

    })
  };

  useEffect(() => {
    if (calendarApi === null) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi]);

  useEffect(() => {
    if (!Utils.isNull(selectedEvent) && !Utils.isNull(selectedEvent.id) && !Utils.isStringEmpty(selectedEvent.id)) {
      toggleModal();
    }

  }, [selectedEvent]);

  const calendarOptions = {
    events: events,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev,next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
    editable: true,

    /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
    eventResizableFromStart: true,

    /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
    dragScroll: true,

    /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
    dayMaxEvents: 2,

    /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
    navLinks: true,

    eventClassNames({event: calendarEvent}) {
      // eslint-disable-next-line no-underscore-dangle
      const colorName = '#945c33';

      return [
        `bg-light-${colorName}`,
      ];
    },

    eventClick({event: clickedEvent}) {

      let value = {
        id: clickedEvent.id,
        title: clickedEvent.title,
        location: clickedEvent.extendedProps.location,
        description: clickedEvent.extendedProps.description,
        attendees: clickedEvent.extendedProps.attendees,
        privacyType: clickedEvent.extendedProps.privacyType,
        documents: clickedEvent.extendedProps.documents,
        startDate: new Date(clickedEvent.start),
        startTime: new Date(clickedEvent.start),
        endDate: new Date(clickedEvent.end),
        endTime: new Date(clickedEvent.end)
      };

      setSelectedEvent(value);

      // * Only grab required field otherwise it goes in infinity loop
      // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
      // event.value = grabEventDataFromEventApi(clickedEvent)

      // eslint-disable-next-line no-use-before-define
      // isAddNewEventSidebarActive.value = true
    },

    customButtons: {
      sidebarToggle: {
        text: <Menu className="d-xl-none d-block"/>,
        click() {
          toggleSidebar(true);
        },
      },
    },

    dateClick(info) {
      const ev = eventTemplate;
      ev.start = info.date;
      ev.end = info.date;
      setSelectedEvent(ev);
      toggleModal();
    },

    /*
      Handle event drop (Also include dragged event)
      ? Docs: https://fullcalendar.io/docs/eventDrop
      ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
    */
    eventDrop({event: droppedEvent}) {
      dispatch(updateEvent(droppedEvent));
      toast.success('Event Updated');
    },

    /*
      Handle event resize
      ? Docs: https://fullcalendar.io/docs/eventResize
    */
    eventResize({event: resizedEvent}) {
      dispatch(updateEvent(resizedEvent));
      toast.success('Event Updated');
    },

    ref: calendarRef,

    // Get direction from app state (store)
    direction: isRtl ? 'rtl' : 'ltr',
  };

  const handleSelectedEvent = () => {

  };

  const handleResetInputValues = () => {

  };

  const toggleModal = (e) => {
    setModalOpen(!modalOpen);

  };

  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={(e) => toggleModal(e)}/>
  );

  return (
    <>
      {
        mode === 'CALENDAR' ?
          <>
            <Card className="shadow-none border-0 mb-0 rounded-0">
              <CardBody className="pb-0">
                <FullCalendar {...calendarOptions} />{' '}
              </CardBody>
            </Card>
            <Modal
              isOpen={modalOpen}
              className="sidebar-lg"
              onOpened={handleSelectedEvent}
              onClosed={handleResetInputValues}
              contentClassName="p-0 overflow-hidden meeting-modal"
              style={{width: '80vw', maxWidth: '70vw'}}
            >
              <ModalHeader
                className="mb-1"
                close={CloseBtn}
                tag="div"
              >
                <h5 className="modal-title">
                  {selectedEvent && selectedEvent.title && selectedEvent.title.length
                    ? ''
                    : 'Add'}{' '}
                  Meeting
                </h5>
              </ModalHeader>

              <PerfectScrollbar options={{wheelPropagation: false}}>
                <ModalBody className="flex-grow-1 pb-sm-0 pb-3">
                  <Meeting selectedEvent={selectedEvent} closeHandler={(e) => toggleModal(e)}
                           refreshHandler={() => loadEvents()} joinHandler={() => setMode('MEETING_ROOM')}/>
                </ModalBody>
              </PerfectScrollbar>
            </Modal>
          </>
          :
          <MeetingRoom meeting={selectedEvent} closeHandler={(e) => {
            toggleModal(e);
            setMode('CALENDAR');
          }}/>
      }
    </>
  );
};

export default memo(CalendarComponent);
