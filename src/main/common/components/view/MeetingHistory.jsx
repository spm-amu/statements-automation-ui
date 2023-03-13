import React, {useState} from 'react';
import {get} from "../../service/RestService";
import SearchBar from "../SearchBar";
import {DataGrid} from "../DataGrid";
import {useNavigate} from "react-router-dom";
import appManager from "../../service/AppManager";
import './Views.css';

const {electron} = window;

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
        "width": "10.0%",
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
      "id": "viewActions",
      "attributes": {
        "filterable": false,
        "width": "10.0%",
        "label": "Chat Polls",
        "toolbar": {
          "items": [
            {
              "id": "chatPollLink",
              "type": "iconButton",
              "icon": "POLL"
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
  "pageSize": 15
};

const MeetingHistory = (props) => {

  const [criteriaParams, setCriteriaParams] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const getSelectedMeetingEvent = (selectedMeeting) => {
    get(`${appManager.getAPIHost()}/api/v1/meeting/fetchMeetingEvent/${selectedMeeting.id}`, (response) => {
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
        fileURL: `${appManager.getAPIHost()}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return (
    <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'meetingHistoryContainer'}>
      <div style={{marginRight: '4px'}}>
        <div className={'view-header'}>Meeting history</div>
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
                  dataUrl={`${appManager.getAPIHost()}/api/v1/meeting/fetchMeetingHistory`}
                  actionHandler={(e) => {
                    if (e.id === 'downloadRecording') {
                      navigate("/view/recordings", {state: e.data.id})
                    }

                    if (e.id === 'chatPollLink') {
                      navigate("/view/pollsHistory", {state: e.data.id})
                    }

                    if (e.id === 'meetingLink') {
                      viewMeeting(e.data);
                    }

                    if (e.id === 'viewWhiteboard') {
                      if (e.data.whiteboardDocumentId) {
                        onDownload(e.data.whiteboardDocumentId);
                      }
                    }
                  }}
        />
      </div>
    </div>
  );
};

export default MeetingHistory;
