import React from 'react';
import TextFieldComponent from '@material-ui/core/TextField';
import Utils from "../../Utils";
import "./Form.css"
import MenuItem from "@material-ui/core/MenuItem";

const TextFieldWrapper = React.memo(React.forwardRef((props, ref) => {
  const [multiline] = React.useState(props.multiline);
  const {height} = props;
  const [rows] = React.useState(Utils.isNull(height) ? 4 : parseFloat(height.replace('px', '')) / 20 - 1);

  return (
    <TextFieldComponent
      select
      className={Utils.isNull(props.className) ? 'input-wrapper' : props.className}
      id={props.id}
      ref={ref}
      type={props.type}
      required={props.required}
      label={props.label}
      value={props.value ? props.value : ''}
      onChange={
        (e) => {
          if(props.valueChangeHandler) {
            props.valueChangeHandler(e);
          }
        }
      }
      onKeyPress={props.keyHandler}
      error={props.hasError}
      helperText={props.hasError ? props.errorMessage : ''}
      margin="dense"
      multiline={multiline}
      minRows={rows}
      disabled={props.disabled}
      size="small"
      style={props.style}
      variant="outlined">
      {props.options.map(option => (
        option.id === '_EMPTY_VALUE' ?
          <MenuItem value="" key={option.id}>
            <em>&nbsp;</em>
          </MenuItem>
          :
          <MenuItem key={option.id}
                    value={option.id}>{Utils.isNull(option.label) ? "" : option.label.trim()}</MenuItem>
      ))}
    </TextFieldComponent>
  );
}));

const TextField = React.memo(React.forwardRef((props, ref) => {
  return (
    <TextFieldWrapper
      ref={ref}
      {...props}
    >
    </TextFieldWrapper>
  );
}));

export default TextField;
