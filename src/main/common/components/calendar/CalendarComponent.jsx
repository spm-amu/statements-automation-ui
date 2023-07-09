import React, {memo, useEffect, useRef, useState} from 'react';

import FullCalendar from '@fullcalendar/react';
import {Card, CardBody} from 'reactstrap';
import '../../assets/scss/app-calendar.scss';
import "./CalenderComponent.css";
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import {get} from "../../service/RestService";
import Utils from '../../Utils';
import {useNavigate} from 'react-router-dom';
import moment from "moment";
import appManager from '../../service/AppManager'
import {MessageType} from '../../types';
import socketManager from '../../service/SocketManager';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import {Menu} from 'react-feather';
import Button from "@material-ui/core/Button";

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
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);
  const dialogRef = useRef(null);
  const [dialogTop, setDialogTop] = useState(null);
  const [dialogLeft, setDialogLeft] = useState(null);
  const navigate = useNavigate();

  const [socketEventHandler] = useState({});

  const StyledDialog = withStyles({
    root: {pointerEvents: "none"},
    paper: {
      pointerEvents: 'auto',
      width: '400px',
      height: '228px',
      minWidth: '400px',
      padding: '0',
      overflow: 'hidden',
      position: 'absolute',
      top: dialogTop,
      left: dialogLeft,
      borderRadius: '4px'
    }
  })(props => <Dialog hideBackdrop {...props} />);


  const handler = () => {
    return {
      get id() {
        return 'meeting-calendar';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.SYSTEM_EVENT:
            onSystemEvent(be.payload);
            break;
        }
      }
    }
  };

  const onSystemEvent = (payload) => {
    if (payload.systemEventType === MessageType.UPDATE_CALENDAR) {
      loadEvents(false);
    }
  };

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  useEffect(() => {
    socketManager.addSubscriptions(socketEventHandler, MessageType.SYSTEM_EVENT);

    if (loading) {
      setLoading(false);
      loadEvents();
    }
  }, []);

  useEffect(() => {
    if (dialogLeft) {
      setOpen(true);
    }
  }, [dialogLeft]);

  const loadEvents = (track = true) => {
    get(`${appManager.getAPIHost()}/api/v1/meeting/fetchMeetings`, (response) => {
      // FREQ=MONTHLY;BYSETPOS=3;BYDAY=WE;INTERVAL=1
      // let myEvent = {
      //    events: [
      //      {
      //        title: 'my recurring event',
      //       // rrule: 'DTSTART:20221113T103000Z\nRRULE:FREQ=MONTHLY;BYSETPOS=-1;BYDAY=WE;INTERVAL=1'
      //        rrule: {
      //          freq: 'MONTHLY',
      //          dtstart: '2022-11-13',
      //          bysetpos: -1,
      //          byweekday: 'WE',
      //          // bymonthday: 21,
      //          interval: 1
      //        }
      //      }
      //    ]
      //  };
      //
      //  setEvents(myEvent.events);
      setEvents(response);
    }, (e) => {

    }, '', track);
  };

  useEffect(() => {
    if (calendarApi === null) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi]);

  useEffect(() => {
    if (!Utils.isNull(selectedEvent) && !Utils.isNull(selectedEvent.id) && !Utils.isStringEmpty(selectedEvent.id)) {
      //navigate("/view/meeting", {state: selectedEvent})
    }
  }, [selectedEvent]);

  const getEndDate = (event) => {
    if (event.end) {
      return new Date(event.end);
    } else if (event.extendedProps.schedule.rrule) {
      let startDate = new Date(event.start);
      return moment(startDate).add("minutes", event.extendedProps.duration).toDate();
    }


    new Date();
  };

  const getCreateMeetingObject = (event) => {
    let end = getEndDate(event);

    return {
      id: event.id,
      title: event.title,
      locations: event.extendedProps.locations,
      description: event.extendedProps.description,
      status: event.extendedProps.status,
      attendees: event.extendedProps.attendees,
      privacyType: event.extendedProps.privacyType,
      documents: event.extendedProps.documents,
      startDate: event.start,
      startTime: event.start,
      endDate: end,
      endTime: end,
      scheduleId: event.extendedProps.schedule.id,
      recurringFreq: event.extendedProps.schedule.rrule.freq,
      recurringInterval: event.extendedProps.schedule.rrule.interval,
      recurringDtstart: new Date(event.extendedProps.schedule.rrule.dtstart),
      recurringUntil: new Date(event.extendedProps.schedule.rrule.until),
      recurringByweekday: event.extendedProps.schedule.rrule.byweekday,
      recurringBysetpos: event.extendedProps.schedule.rrule.bysetpos,
      recurringBymonthday: event.extendedProps.schedule.rrule.bymonthday,
      askToJoin: event.extendedProps.askToJoin
    };
  };

  const createEventPopup = (el) => {
    return <>
      {
        selectedEvent && <div className={'event-popup'}>
          <div className={'top-toolbar row no-padding no-margin'}>
            <div className={'left col no-padding no-margin'}>
              <IconButton
                onClick={() => setOpen(false)}
                style={{
                  color: '#FFFFFF'
                }}
              >
                <Icon id={'CLOSE'} color={'#945c33'}/>
              </IconButton>
            </div>
            <div className={'right col no-padding no-margin'}>
              <IconButton
                onClick={() => {
                  navigate("/view/meeting", {state: getCreateMeetingObject(selectedEvent)});
                }}
                style={{
                  color: '#FFFFFF'
                }}
              >
                <Icon id={'MAXIMIZE'} color={'#945c33'}/>
              </IconButton>
            </div>
          </div>
          <div className={'summary'}>
            <div className={'title'}>
              {selectedEvent.title}
            </div>
            <div>
              {toDateTimeString(selectedEvent.start)}
            </div>
            <div className={'organiser'}>
              Organiser: {selectedEvent.extendedProps.attendees.find((a) => a.type === 'HOST').name}
            </div>
            <div style={{marginTop: '16px'}}>
              <Button
                variant={'contained'}
                size="large"
                style={{color: '#ffffff', backgroundColor: '#198754', borderRadius: '4px', marginRight: '2px'}}
                onClick={(e) => {
                    navigate('/view/joinMeetingSettings', {state: getCreateMeetingObject(selectedEvent)});
                }}
              >
                JOIN
              </Button>
            </div>
          </div>
        </div>
      }
    </>
  };

  const toDateTimeString = (date) => {
    let dateStr = selectedEvent.start.toLocaleDateString();
    let timeStrTokens = selectedEvent.start.toLocaleTimeString().split(':');

    return dateStr + ' ' + timeStrTokens[0] + ':' + timeStrTokens[1];
  };

  const calenderScrollListener = () => {
    setOpen(false)
  };

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
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
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

    viewDidMount() {
      setOpen(false);
    },

    eventClick({el: el, event: event}) {
      // * Only grab required field otherwise it goes in infinity loop
      // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
      // event.value = grabEventDataFromEventApi(clickedEvent)

      // eslint-disable-next-line no-use-before-define
      // isAddNewEventSidebarActive.value = true

      if (selectedEvent) {
        setOpen(event.id === selectedEvent.id);
      } else {
        setOpen(false);
      }

      var rect = el.getBoundingClientRect();

      let topOffset = rect.bottom + 250 > document.body.getBoundingClientRect().bottom ? -1 * ((rect.bottom + 250) - document.body.getBoundingClientRect().bottom) : 8;
      let leftOffset = rect.right + 400 > document.body.getBoundingClientRect().right ? (rect.right + 400) - document.body.getBoundingClientRect().right : 64;
      setDialogTop((rect.top + topOffset) + 'px');
      setDialogLeft((rect.left - leftOffset) + 'px');
      setSelectedEvent(event);

      let elementsByClassName = document.getElementsByClassName('fc-scroller-liquid-absolute');
      if (elementsByClassName && elementsByClassName.length > 0) {
        elementsByClassName[0].removeEventListener("scroll", calenderScrollListener);
        elementsByClassName[0].addEventListener('scroll', calenderScrollListener);
      }

      elementsByClassName = document.getElementsByClassName('fc-scroller-liquid');
      if (elementsByClassName && elementsByClassName.length > 0) {
        elementsByClassName[0].removeEventListener("scroll", calenderScrollListener);
        elementsByClassName[0].addEventListener('scroll', calenderScrollListener);
      }
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
      let date = new Date(info.dateStr);
      const event = {
        ...eventTemplate,
        "startDate": date,
        "endDate": date,
        "recurringStartDate": date,
        "recurringEndDate": date
      };

      if (!open && moment(new Date()).startOf('day') <= moment(date).startOf('day')) {
        setSelectedEvent(event);
        navigate("/view/meeting", {state: event});
      }
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

    /*
      Handle event mouse enter
      ? Docs: https://fullcalendar.io/docs/eventMouseEnter
    */
    eventMouseEnter({el: el, event: event}) {
    },


    /*
      Handle event mouse enter
      ? Docs: https://fullcalendar.io/docs/eventMouseEnter
    */
    eventMouseLeave({el: el}) {
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
          <StyledDialog
            open={open}
            ref={dialogRef}
            onClose={() => {
              setOpen(false)
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            aria-modal={false}
            fullWidth
          >
            <div className={'w-100 h-100'}>
              {
                createEventPopup()
              }
            </div>
          </StyledDialog>
        </div>
      }
    </>
  );
};

export default memo(CalendarComponent);
