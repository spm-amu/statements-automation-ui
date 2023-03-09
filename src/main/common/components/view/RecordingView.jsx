import React, {useState} from 'react';
import {DataGrid} from "../DataGrid";
import appManager from "../../service/AppManager";
const { electron } = window;

const grid = {
  "id": "meetingList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "name",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "32.0%",
        "label": "Name",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "size",
      "attributes": {
        "filterable": false,
        "width": "32.0%",
        "label": "Size",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "downloadActions",
      "attributes": {
        "filterable": false,
        "width": "32.0%",
        "label": "Recording",
        "toolbar": {
          "items": [
            {
              "id": "downloadRecording",
              "type": "iconButton",
              "icon": "DOWNLOAD"
            }
          ]
        },
        "sortable": false
      }
    }

  ],
  "pageSize": 75
};

const RecordingView = (props) => {

  const [criteriaParams] = useState({});

  const onDownload = (documentId) => {
    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: `${appManager.getAPIHost()}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', margin: '16px 0' }}>
      <div style={{ marginRight: '4px' }}>
        <ul>
          <li>
            <h3 style={{ color: 'black' }}>Recordings</h3>
          </li>
          <DataGrid config={grid}
                    bodyMaxHeight={"65vh"}
                    criteriaParams={criteriaParams}
                    dataUrl={`${appManager.getAPIHost()}/api/v1/document/fetchMeetingRecordings/${props.meetingId}`}
                    actionHandler={(e) => {
                      onDownload(e.data.id);
                    }}
          />
        </ul>
      </div>
    </div>
  );
};

export default RecordingView;
