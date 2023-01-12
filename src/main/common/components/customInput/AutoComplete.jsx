import React, {useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import {host, post} from "../../service/RestService";
import "./Form.css";
import Utils from "../../Utils";
import appManager from "../../../common/service/AppManager";

const AutoCompleteComponent = React.memo(React.forwardRef((props, ref) => {

  const [options, setOptions] = React.useState([]);
  const [value, setValue] = React.useState(props.value ? props.value : []);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  /*useEffect(() => {
    if(props.value) {
      let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
      let filtered = props.value.filter(val => val.userId !== userDetails.userId);
      console.log("\n\n\nUNCHAINED : ", props.value);
      console.log("FILTERED : ", filtered);

      setValue(filtered)
    }
  }, [props.value]);*/


  const handleOpen = () => {
    if (inputValue.length > 0) {
      setOpen(true);
    }
  };

  const renderOption = (option) => {
    if (props.showImages && option.imagePath) {
      return (
        <Box component="li" sx={{'& > img': {mr: 2, flexShrink: 0}}}>
          <img
            style={{marginRight: '4px'}}
            width="20"
            src={`${host}/${option.imagePath}`}
            srcSet={`${host}/${option.imagePath} 2x`}
            alt=""
          />
          {option.label}
        </Box>);
    }

    return (
      <Box component="span" sx={{'& > img': {mr: 2, flexShrink: 0}}}>
        {option.label}
      </Box>);
  };

  const validateInput = (val) => {
    return props.validationRegex.test(val);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }

    if (!Utils.isNull(newInputValue) && !Utils.isStringEmpty(newInputValue) && !Utils.isNull(props.optionsUrl)) {
      let exclusions = [];

      for (const valueElement of value) {
        if(valueElement.userId) {
          exclusions.push(valueElement.userId);
        }
      }

      post(`${props.optionsUrl}`, (response) => {
          if (response.records.length > 0) {
            let userDetails = appManager.getUserDetails();
            setOptions(response.records.filter(option => option.userId !== userDetails.userId));
          } else {
            if(validateInput(newInputValue) && !value.find((val) => val.name === newInputValue)) {
              let emptyOptions = [];
              emptyOptions.push({
                emailAddress: newInputValue,
                type: 'REQUIRED',
                external: true,
                name: newInputValue,
                label: newInputValue
              });

              setOptions(emptyOptions);
            }
          }
        }, (e) => {

        },
        {
          "parameters": [
            {
              "name": `${props.searchAttribute}`,
              "value": newInputValue
            },
            {
              "name": 'exclusions',
              "value": exclusions
            }
          ],
          "pageSize": 2000,
          "currentPage": 0
        }, null, false, true)
    } else {
      let userDetails = appManager.getUserDetails();
      setOptions(props.optionsData.filter(option => option.userId !== userDetails.userId))
    }
  };

  return (
    <Autocomplete
      freeSolo
      className={props.disabled ? "input-wrapper auto-complete-disabled" : "input-wrapper"}
      noOptionsText={props.invalidText}
      id={props.id}
      sx={{width: 300}}
      options={options}
      autoHighlight
      value={props.value ? props.value : []}
      multiple={!Utils.isNull(props.multiple) ? props.multiple : false}
      getOptionLabel={(option) => props.labelClickHandler ? <span className={'option-label'} onClick={(e) => props.labelClickHandler(option.id)}>{option.label}</span> : option.label}
      open={open}
      onOpen={handleOpen}
      disabled={props.enableFile ? false : props.disabled}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={
        (e, newValue, reason) => {
          if (props.valueChangeHandler) {
            props.valueChangeHandler(newValue, props.id);
            setValue(newValue);
          }
        }
      }
      renderOption={(option) => (
        renderOption(option)
      )}
      renderInput={(params) => (
        <TextField
          className={props.className}
          {...params}
          label={props.label}
          variant={props.borderless ? 'standard' : 'outlined'}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password',
          }}
        />
      )}
    />
  );
}));

const AutoCompleteField = React.memo(React.forwardRef((props, ref) => {
  return (
    <AutoCompleteComponent
      ref={ref}
      {...props}>
    </AutoCompleteComponent>
  );
}));

export default AutoCompleteField;




