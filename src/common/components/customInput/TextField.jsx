import React from 'react';
import TextFieldComponent from '@material-ui/core/TextField';
import Utils from "../../Utils";
import "./Form.css"

const TextFieldWrapper = React.memo(React.forwardRef((props, ref) => {
  const [multiline] = React.useState(props.multiline);
  const {height} = props;
  const [rows] = React.useState(Utils.isNull(height) ? 4 : parseFloat(height.replace('px', '')) / 20 - 1);

  return (
    <TextFieldComponent
      className={Utils.isNull(props.className) ? 'input-wrapper' : props.className}
      id={props.id}
      ref={ref}
      type={props.type}
      required={props.required}
      label={props.label}
      inputProps={props.inputProps}
      onChange={
        (e) => {
          if(props.valueChangeHandler) {
            props.valueChangeHandler(e);
          }
        }
      }
      error={props.hasError}
      helperText={props.hasError ? props.errorMessage : ''}
      margin="dense"
      multiline={multiline}
      minRows={rows}
      disabled={props.disabled}
      size="small"
      style={props.style}
      variant="outlined">
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
