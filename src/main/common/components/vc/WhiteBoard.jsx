/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import './WhiteBoard.css';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";

const WhiteBoard = (props) => {

  return (
    <div className={'whiteboard'}>
      <div className={'row centered-flex-box'} style={{marginLeft: 0, marginRight: 0}}>
        <div style={{width: '320px'}}>
            <IconButton
              onClick={() => {
              }}
              style={{
                backgroundColor: "#404239",
                color: 'white',
                marginRight: '4px'
              }}
            >
                <Icon id={'VIDEOCAM'}/>
            </IconButton>
        </div>
        <div className={'col'}>
          Workspace
        </div>
      </div>
    </div>
  );
};

export default WhiteBoard;
