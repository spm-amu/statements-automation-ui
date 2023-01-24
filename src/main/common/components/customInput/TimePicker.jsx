﻿import React from 'react';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';

const CustomTimePickerComponent = React.memo(React.forwardRef((props, ref) => {

  const handleDateChange = date => {
    if(props.valueChangeHandler) {
      props.valueChangeHandler(date, props.id);
    }
  };

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container ref={ref}>
                <KeyboardTimePicker
                    id={props.id}
                    InputProps={props.InputProps}
                    disabled={props.disabled}
                    required={props.required}
                    ampm={false}
                    label={props.label}
                    value={props.value}
                    className={props.className}
                    error={props.hasError}
                    helperText={props.hasError ? props.errorMessage : ''}
                    margin="dense"
                    inputVariant="outlined"
                    style={{textAlign: 'left'}}
                    onChange={handleDateChange}
                    size="small"
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                        'disabled': props.disabled
                    }}
                    readOnly={props.readOnly}
                />
            </Grid>
        </MuiPickersUtilsProvider>
    );
}));

const TimePicker = React.memo(React.forwardRef((props, ref) => {
    return (
      <CustomTimePickerComponent
        ref={ref}
        {...props}>
      </CustomTimePickerComponent>
    );
}));

export default TimePicker;
