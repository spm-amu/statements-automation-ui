import React, {Fragment, useState} from 'react';
import IconButton from "@material-ui/core/IconButton";
import Icon from "./Icon";
import {get} from "../service/RestService";
import appManager from "../service/AppManager";
import PDFViewer from "./PDFViewer";

const StatementViewer = (props) => {

  const [file, setFile] = useState(null);

  return <div style={{width: '100%'}}>
    <div style={{padding: '0 32px', borderTop: '1px solid #e1e1e1', width: '100%'}}>
      <IconButton
        style={{color: '#01476C', width: '36px', height: '36px'}}
        onClick={(e) => {
          get(`${appManager.getAPIHost()}/statements/api/v1/cob/statement/file/get/${props.data.id}`, (response) => {
            if(response) {
              setFile("data:image/png;base64," + response.doc);
            }
          }, (e) => {
          }, '', false);
        }}
      >
        <Icon id={'FOLDER'} />
      </IconButton>
    </div>
    <div>
      {
        file &&
        <PDFViewer pdf={file}/>
      }
    </div>
  </div>
};

export default StatementViewer;
