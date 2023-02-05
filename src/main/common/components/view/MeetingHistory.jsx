import React, {useState} from 'react';
import {get, host} from "../../service/RestService";
import SearchBar from "../SearchBar";
import {DataGrid} from "../DataGrid";
import {useNavigate} from "react-router-dom";
import appManager from "../../service/AppManager";

const grid = {
  "id": "meetingList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "title",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "35.0%",
        "label": "Title",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "fieldType": "DATE_TIME",
      "id": "start",
      "attributes": {
        "filterable": false,
        "width": "25.0%",
        "label": "Meeting Date",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "viewActions",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "View Meeting",
        "toolbar": {
          "items": [
            {
              "id": "meetingLink",
              "type": "iconButton",
              "icon": "LINK"
            }
          ]
        },
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "downloadActions",
      "attributes": {
        "filterable": false,
        "width": "10.0%",
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
    },
    {
      "type": "gridColumn",
      "id": "whiteboardActions",
      "attributes": {
        "filterable": false,
        "width": "10.0%",
        "label": "Whiteboard",
        "toolbar": {
          "items": [
            {
              "id": "viewWhiteboard",
              "type": "iconButton",
              "icon": "NOTE"
            }
          ]
        },
        "sortable": false
      }
    }

  ],
  "pageSize": 75
};

const MeetingHistory = (props) => {

  const [criteriaParams, setCriteriaParams] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const getSelectedMeetingEvent = (selectedMeeting) => {
    get(`${host}/api/v1/meeting/fetchMeetingEvent/${selectedMeeting.id}`, (response) => {
      navigate("/view/meeting", {state: response})
    }, (e) => {
    }, '', false);

  };

  const viewMeeting = (selectedMeeting) => {
    getSelectedMeetingEvent(selectedMeeting);
  };

  const onDownload = (documentId) => {
    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: `${host}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', margin: '16px 0' }}>
      <div style={{ marginRight: '4px' }}>
        <ul>
          <li>
            <h3>Meeting History</h3>
          </li>
          <div className={'searchbar'}>
            <SearchBar onSearch={(searchValue) => {
              setCriteriaParams({
                title: searchValue
              })
            }}/>
          </div>
          <DataGrid config={grid}
                    bodyMaxHeight={"65vh"}
                    criteriaParams={criteriaParams}
                    dataUrl={`${host}/api/v1/meeting/fetchMeetingHistory`}
                    actionHandler={(e) => {

                      if(e.id === 'downloadRecording') {
                        onDownload(e.data.id);
                      }

                      if(e.id === 'meetingLink') {
                        viewMeeting(e.data);
                      }

                      if(e.id === 'viewWhiteboard') {
                        navigate("/view/whiteboard", {state: e.data.id})
                      }
                    }}
          />
        </ul>
      </div>
    </div>
  );
};

export default MeetingHistory;
