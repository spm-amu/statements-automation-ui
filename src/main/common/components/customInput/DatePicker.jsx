import React from 'react';
import 'date-fns';
import Utils from '../../Utils';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const CustomDatePickerComponent = React.memo(React.forwardRef((props, ref) => {
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);
  const base = props.base;

  const handleDateChange = date => {
    if(props.valueChangeHandler) {
      props.valueChangeHandler(date, props.id);
    }
  };

  const formatNumber = (n) => {
    return n < 10 ? '0' + n : n;
  };

  const getLimitDate = (id) => {
    let dateAttr = props.limit;
    if(dateAttr) {
      if(dateAttr.toString().includes('now')) {
        let operator = dateAttr.toString().includes("-") ? '-' : '+';
        let tokens = dateAttr.toString().split(operator);
        let days = 0;
        if(tokens.length > 0 && !Utils.isNull(tokens[1])) {
          days = parseFloat(tokens[1].replace('d', '').trim());
        }

        let limit = new Date();
        if("-" === operator) {
          limit.setDate(limit.getDate() - days);
        } else {
          limit.setDate(limit.getDate() + days);
        }

        return limit.getFullYear() + "-" + formatNumber(limit.getMonth() + 1) + "-" + formatNumber(limit.getDate());
      }
    }

    return id === "minDate" ? "1970-01-01" : "9000-12-31";
  };

  React.useEffect(() => {
    if(minDate === null) {
      setMinDate(getLimitDate("minDate"));
    }

    if(maxDate === null) {
      setMaxDate(getLimitDate("maxDate"));
    }
  });

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container ref={ref}>
        <KeyboardDatePicker
          id={props.id}
          InputProps={props.InputProps}
          disabled={props.disabled}
          required={props.required}
          format="dd/MM/yyyy"
          label={props.label}
          value={props.value ? props.value : null}
          className={props.className}
          error={props.hasError}
          margin="dense"
          inputVariant="outlined"
          style={props.style}
          onChange={handleDateChange}
          size="small"
          KeyboardButtonProps={{
            'aria-label': 'change date',
            'disabled': props.disabled
          }}
          minDate={minDate}
          maxDate={maxDate}
          readOnly={props.readOnly}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
}));

const DatePicker = React.memo(React.forwardRef((props, ref) => {
  return (
    <CustomDatePickerComponent
      ref={ref}
      {...props}>
    </CustomDatePickerComponent>
  );
}));

export default DatePicker;
