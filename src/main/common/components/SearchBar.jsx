import React from 'react';
import Utils from "../Utils";
import "./SearchBar.css"
import Icon from "./Icon";
import IconButton from "@material-ui/core/IconButton";
import TextField from "./customInput/TextField";

const SearchBarComponent = React.memo(React.forwardRef((props, ref) => {
  const [searchValue, setSearchValue] = React.useState();
  const [multiline] = React.useState(props.multiline);
  const {height} = props;
  const [rows] = React.useState(Utils.isNull(height) ? 4 : parseFloat(height.replace('px', '')) / 20 - 1);

  return (
    <div className="search-component row">
      <div className={"col input-box"}>
        <TextField
          style={{width: '100%'}}
          value={searchValue}
          label="Title"
          id="title"
          valueChangeHandler={(e) => {
            setSearchValue(e.target.value)
          }}
          errorMessage={'A meeting title is required. Please enter a value'}
        />
      </div>
      <div className={"icon"}>
        <IconButton
          onClick={(e) => {
            props.onSearch(searchValue);
          }}
          style={{
            marginRight: '4px'
          }}
        >
          <Icon id={'SEARCH'}/>
        </IconButton>
      </div>
    </div>
  );
}));

const SearchBar = React.memo(React.forwardRef((props, ref) => {
  return (
    <SearchBarComponent
      ref={ref}
      {...props}
    >
    </SearchBarComponent>
  );
}));

export default SearchBar;
