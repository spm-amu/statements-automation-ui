import React from 'react';
import "./PersonCard.css"
import Icon from "./Icon";
import IconButton from "@material-ui/core/IconButton";

const PersonCardComponent = React.memo(React.forwardRef((props, ref) => {
  return (
    <div className="person-card">
      <div className="row" style={{borderBottom: '1px solid #e1e1e1', paddingBottom: '8px'}}>
        <div>
          <img src={props.data.avatar ? props.data.avatar : require('../../desktop/dashboard/images/noimage-person.png')} alt={""}  style={{borderRadius: '50%'}}/>
        </div>
        <div className={"user-details"}>
          {
            props.data.name
          }
        </div>
      </div>
      <div className={"actions row"}>
        <div style={{marginRight: '4px'}} className={'col-*-*'}>
          <IconButton
            onClick={(e) => {
              props.onSearch(searchValue);
            }}
            style={{
              marginRight: '4px'
            }}
          >
            <Icon id={'CALL_END'}/>
          </IconButton>
        </div>
        <div className={'col-*-*'}>
          <IconButton
            onClick={(e) => {
              props.onSearch(searchValue);
            }}
            style={{
              marginRight: '4px'
            }}
          >
            <Icon id={'CHAT_BUBBLE'}/>
          </IconButton>
        </div>
      </div>
    </div>
  );
}));

const PersonCard = React.memo(React.forwardRef((props, ref) => {
  return (
    <PersonCardComponent
      ref={ref}
      {...props}
    >
    </PersonCardComponent>
  );
}));

export default PersonCard;
