import React, {useState} from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';

const EventMessageComponent = React.memo(React.forwardRef((props, ref) => {

  console.log('######: ', props.recurringEndDate);

  const generateEventMessage = () => {
    let prefix = "Occurs every";
    if(props.recurringType === 'DAILY') {
      if(props.numberOfOccurences > 1 ) {
        return prefix + " " + props.numberOfOccurences + " days";
      } else {
        return prefix + " day";
      }
    } else if(props.recurringType === 'WEEKLY') {
      if(props.numberOfOccurences > 1 ) {
        return prefix + " " + props.numberOfOccurences + " weeks";
      } else {
        return prefix + " week";
      }
    } else if(props.recurringType === 'MONTHLY') {
      if(props.monthlyDayType === 'monthlyWeekDay') {
        if (props.numberOfOccurences > 1) {
          return prefix + " " + props.numberOfOccurences + " months on " + props.bysetpos + " " + props.byDay;
        } else {
          return prefix + " month on " + props.bysetpos + " " + props.byDay;
        }
      } else {
        if (props.numberOfOccurences > 1) {
          return prefix + " " + props.numberOfOccurences + " months on day " + props.byMonthDay;
        } else {
          return prefix + " month on day " + props.byMonthDay;
        }
      }
    }
  }

  return (
    <div>
      <br/>
      <p>
        { props.recurringEndDate ? `${generateEventMessage()} until ${props.recurringEndDate.toLocaleDateString("en-US")}` : generateEventMessage()}
      </p>
    </div>
  );
}));

export default EventMessageComponent;




