import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import {countries} from './countries';
import host from "../../service/RestService";
import "./Form.css";

const AutoCompleteComponent = React.memo(React.forwardRef((props, ref) => {

  const [options, setOptions] = React.useState([]);
  const renderOption = (option) => {
    if(props.showImages) {
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

  return (
    <Autocomplete
      className={"input-wrapper"}
      id={props.id}
      sx={{width: 300}}
      options={countries}
      autoHighlight
      multiple={true}
      getOptionLabel={(option) => option.label}
      onChange={
        (e) => {
          console.log("\n\nCHANGE FIREEE");
        }
      }
      onInputChange={
        (e, value) => {
          console.log("KEY PRESS : ", value)
        }
      }

      renderOption={(option) => (
        renderOption(option)
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          variant="outlined"
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




