import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';

import styles from '../../assets/jss/components/customInputStyle';

const useStyles = makeStyles(styles);

export default function CustomInput(props) {
  const classes = useStyles();
  const {
    formControlProps,
    labelText,
    id,
    labelProps,
    inputProps,
    error,
    white,
    inputRootCustomClasses,
    success,
    helperText,
    disabled
  } = props;

  const labelClasses = classNames({
    [` ${classes.labelRootError}`]: error,
    [` ${classes.labelRootSuccess}`]: success && !error,
  });
  const underlineClasses = classNames({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true,
    [classes.whiteUnderline]: white,
  });
  const marginTop = classNames({
    [inputRootCustomClasses]: inputRootCustomClasses !== undefined,
  });
  const inputClasses = classNames({
    [classes.input]: true,
    [classes.whiteInput]: white,
  });
  let formControlClasses;
  if (formControlProps !== undefined) {
    formControlClasses = classNames(
      formControlProps.className,
      classes.formControl
    );
  } else {
    formControlClasses = classes.formControl;
  }
  const helpTextClasses = classNames({
    [classes.labelRootError]: error,
    [classes.labelRootSuccess]: success && !error,
  });
  const newInputProps = {
    maxLength:
      inputProps && inputProps.maxLength ? inputProps.maxLength : undefined,
    minLength:
      inputProps && inputProps.minLength ? inputProps.minLength : undefined,
  };
  return (
    <FormControl {...formControlProps} className={formControlClasses}>
      {labelText !== undefined ? (
        <InputLabel
          className={`${classes.labelRoot} ${labelClasses}`}
          htmlFor={id}
          {...labelProps}
        >
          {labelText}
        </InputLabel>
      ) : null}
      <Input
        classes={{
          input: inputClasses,
          root: marginTop,
          disabled: classes.disabled,
          underline: underlineClasses,
        }}
        onKeyUp={props.onKeyUp}
        multiline={props.multiline}
        id={id}
        {...inputProps}
        inputProps={newInputProps}
        disabled={disabled}
      />
      {helperText !== undefined ? (
        <FormHelperText id={`${id}-text`} className={helpTextClasses}>
          {' '}
          {helperText}{' '}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}

CustomInput.propTypes = {
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  inputRootCustomClasses: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  white: PropTypes.bool,
  helperText: PropTypes.node,
};
