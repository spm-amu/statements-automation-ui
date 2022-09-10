import './Calendar.css';
import {Col, Row} from "reactstrap";
import CalendarComponent from "../calendar/CalendarComponent"

const calendarsColor = {
  Business: 'primary',
  Holiday: 'success',
  Personal: 'danger',
  Family: 'warning',
  ETC: 'info',
};

const Calendar = () => {
  return <>
    <div className="app-calendar overflow-hidden border">
      <Row className="g-0">
        <Col className="position-relative">
          <CalendarComponent
            isRtl={false}
            calendarsColor={calendarsColor}
          />
        </Col>
      </Row>
    </div>
  </>;
};

export default Calendar;
