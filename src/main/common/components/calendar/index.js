import { Fragment, useState, useEffect } from 'react';

// ** Third Party Components
import classnames from 'classnames';
import { Row, Col } from 'reactstrap';

// ** Calendar App Component Imports
import { useSelector, useDispatch } from 'react-redux';
import CalendarComponent from './CalendarComponent';
import AddEventSidebar from './AddEventSidebar';

// ** Store & Actions
import {
  fetchEvents,
  selectEvent,
  updateEvent,
  addEvent,
  removeEvent,
} from './store';

// ** Styles
import '../../assets/scss/app-calendar.scss';
import './index.css';

// ** CalendarColors
const calendarsColor = {
  Business: 'primary',
  Holiday: 'success',
  Personal: 'danger',
  Family: 'warning',
  ETC: 'info',
};

const Calendar = () => {
  // ** Variables
  const dispatch = useDispatch();
  const store = useSelector((state) => state.calendar);

  // ** states
  const [calendarApi, setCalendarApi] = useState(null);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

  // ** AddEventSidebar Toggle Function
  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen);

  // ** LeftSidebar Toggle Function
  const toggleSidebar = (val) => setLeftSidebarOpen(val);

  // ** Blank Event Object
  const blankEvent = {
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

  // ** refetchEvents
  const refetchEvents = () => {
    if (calendarApi !== null) {
      calendarApi.refetchEvents();
    }
  };

  // ** Fetch Events On Mount
  useEffect(() => {
    dispatch(fetchEvents('GabrielleRobertson'));
  }, []);

  return (
    <>
      <div className="app-calendar overflow-hidden border">
        <Row className="g-0">
          <Col className="position-relative">
            <CalendarComponent
              isRtl={false}
              store={store}
              dispatch={dispatch}
              blankEvent={blankEvent}
              calendarApi={calendarApi}
              selectEvent={selectEvent}
              updateEvent={updateEvent}
              toggleSidebar={toggleSidebar}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
              handleAddEventSidebar={handleAddEventSidebar}
            />
          </Col>
          <div
            className={classnames('body-content-overlay', {
              show: leftSidebarOpen === true,
            })}
            onClick={() => toggleSidebar(false)}
          />
        </Row>
      </div>
      <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        open={addSidebarOpen}
        selectEvent={selectEvent}
        updateEvent={updateEvent}
        removeEvent={removeEvent}
        calendarApi={calendarApi}
        refetchEvents={refetchEvents}
        calendarsColor={calendarsColor}
        handleAddEventSidebar={handleAddEventSidebar}
      />
    </>
  );
};

export default Calendar;
