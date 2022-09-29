import './Calendar.css';
import CalendarComponent from "../calendar/CalendarComponent"

const calendarsColor = {
  Business: 'primary',
  Holiday: 'success',
  Personal: 'danger',
  Family: 'warning',
  ETC: 'info',
};

const Calendar = () => {
  return <div className="app-calendar h-100">
    <CalendarComponent
      isRtl={false}
      calendarsColor={calendarsColor}
    />
  </div>;
};

export default Calendar;
