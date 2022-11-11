import {memo, useEffect, useRef, useState} from 'react';

import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import {Menu} from 'react-feather';
import {Card, CardBody} from 'reactstrap';
import '../../assets/scss/app-calendar.scss';
import "./CalenderComponent.css";
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import {get, host} from "../../service/RestService";
import Utils from '../../Utils';
import {useNavigate} from 'react-router-dom';

// https://fullcalendar.io/docs/rrule-plugin documentation to use for recurrence

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
    locations: [
      {
        id: '',
        name: '',
      },
    ]
  },
};

const CalendarComponent = (props) => {
  const {isRtl} = props;
  const [calendarApi, setCalendarApi] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      setLoading(false);
      loadEvents();
    }
  }, []);

  const loadEvents = () => {
    get(`${host}/api/v1/meeting/fetchMeetings`, (response) => {
      console.log('EVENTS: ', response);
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
      navigate("/view/meeting", {state: selectedEvent})
    }

  }, [selectedEvent]);

  const calendarOptions = {
    events: events,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, rrulePlugin],
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
    height: '100%',
    stickyHeaderDates: true,

    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },

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
        locations: clickedEvent.extendedProps.locations,
        description: clickedEvent.extendedProps.description,
        attendees: clickedEvent.extendedProps.attendees,
        privacyType: clickedEvent.extendedProps.privacyType,
        documents: clickedEvent.extendedProps.documents,
        startDate: new Date(clickedEvent.start),
        startTime: new Date(clickedEvent.start),
        endDate: new Date(clickedEvent.end),
        endTime: new Date(clickedEvent.end),
        recurringStartDate: new Date(clickedEvent.extendedProps.recurringStart),
        recurringEndDate: new Date(clickedEvent.extendedProps.recurringEnd)

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

      const event = {
        ...eventTemplate,
        "startDate": new Date(info.dateStr),
        "endDate": new Date(info.dateStr),
        "recurringStartDate": new Date(info.dateStr),
        "recurringEndDate": new Date(info.dateStr)
      };

      setSelectedEvent(event);
      navigate("/view/meeting", {state: event});
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


  return (
    <>
      {
        <div className={'h-100'}>
          <Card className={'h-100'} style={{zIndex: 0}}>
            <CardBody className={'h-100'}>
              <FullCalendar {...calendarOptions} />{' '}
            </CardBody>
          </Card>
        </div>
      }
    </>
  );
};

export default memo(CalendarComponent);
