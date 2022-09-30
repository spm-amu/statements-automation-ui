import React from 'react';
import './ClosablePanel.css'

import {useLocation, useParams} from 'react-router-dom';
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";

const ClosablePanel = (props) => {
  const params = useParams();
  const location = useLocation();

  return (
    <div style={{width: '100%'}} className={'closable-panel h-100'}>
      <div className={'closable-panel-header'}>
        <IconButton
          style={{
            marginRight: '4px'
          }}
          onClick={(e) => props.closeHandler(e)}
        >
          <Icon id={'CLOSE'} />
        </IconButton>
      </div>
      <div className={'closable-panel-content'}>

      </div>
    </div>
  );
};

export default ClosablePanel;
