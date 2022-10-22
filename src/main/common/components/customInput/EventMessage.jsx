import React, {useState} from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import "./Modal.css";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";


const EventMessageComponent = React.memo(React.forwardRef((props, ref) => {

  const generateEventMessage = () => {

    let prefix = "Occurs every";
    if(props.recurringType === 'DAILY') {
      if(props.eventRecurrenceNumber > 1 ) {
        return prefix + " " + props.eventRecurrenceNumber + " days";
      } else {
        return prefix + " day";
      }
    } else if(props.recurringType === 'WEEKLY') {
      if(props.eventRecurrenceNumber > 1 ) {
        return prefix + " " + props.eventRecurrenceNumber + " weeks";
      } else {
        return prefix + " week";
      }
    } else if(props.recurringType === 'MONTHLY') {
      if(props.eventRecurrenceNumber > 1 ) {
        return prefix + " " + props.eventRecurrenceNumber + " months";
      } else {
        return prefix + " day";
      }
    }
  }

  return (
    <div>
      <br/>
      <p>{generateEventMessage()}</p>
    </div>
  );
}));

export default EventMessageComponent;




