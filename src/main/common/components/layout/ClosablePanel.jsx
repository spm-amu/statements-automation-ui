import React from 'react';
import './ClosablePanel.css'

import {useLocation, useParams} from 'react-router-dom';
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";

const ClosablePanel = (props) => {
  const params = useParams();
  const location = useLocation();
  const {
    children
  } = props;

  return (
    <div style={{width: '100%'}} className={'closable-panel'}>
      <div className={'closable-panel-header row'}>
        <div className={'title col'}>
          {props.title}
        </div>
        <div style={{width: '64px'}}>
          <IconButton
            style={{
              marginRight: '4px'
            }}
            onClick={(e) => props.closeHandler(e)}
          >
            <Icon id={'CLOSE'} color={'white'}/>
          </IconButton>
        </div>
      </div>
      <div className={'closable-panel-content'}>
        {
          children
        }
      </div>
    </div>
  );
};

export default ClosablePanel;
