import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import {host, post} from "../../service/RestService";
import "./Form.css";
import Utils from "../../Utils";

const AutoCompleteComponent = React.memo(React.forwardRef((props, ref) => {

  const [options, setOptions] = React.useState([]);
  const [value] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

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
      <Box component="li" sx={{'& > img': {mr: 2, flexShrink: 0}}}>
        {option.label}
      </Box>);
  };

  const validateEmail = (val) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }

    if (!Utils.isNull(newInputValue) && !Utils.isStringEmpty(newInputValue) && !Utils.isNull(props.optionsUrl)) {
      post(`${props.optionsUrl}`, (response) => {
          if (response.records.length > 0) {
            let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
            console.log("\n\n\nRECS : ", response.records);
            setOptions(response.records.filter(option => option.userId !== userDetails.userId))
          } else {
            if(validateEmail(newInputValue)) {
              let emptyOptions = [];
              emptyOptions.push({
                emailAddress: newInputValue,
                type: 'REQUIRED',
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
            }
          ],
          "pageSize": 2000,
          "currentPage": 0
        })
    }
  };

  return (
    <Autocomplete
      freeSolo
      className={"input-wrapper"}
      noOptionsText={props.invalidText}
      id={props.id}
      sx={{width: 300}}
      options={options}
      autoHighlight
      value={props.value}
      multiple={!Utils.isNull(props.multiple) ? props.multiple : false}
      getOptionLabel={(option) => option.label}
      open={open}
      onOpen={handleOpen}
      disabled={props.disabled}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={
        (e, newValue, reason) => {
          if (props.valueChangeHandler) {
            props.valueChangeHandler(newValue, props.id);
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




