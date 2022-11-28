import React, {useState} from 'react';
import {host} from "../../service/RestService";
import SearchBar from "../SearchBar";
import {DataGrid} from "../DataGrid";
import {useNavigate} from "react-router-dom";

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
      "id": "actions",
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
      "id": "actions",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Recording",
        "toolbar": {
          "items": [
            {
              "id": "dowmload",
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

const MeetingHistory = (props) => {

  const [criteriaParams, setCriteriaParams] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const prepareSelectedMeeting = (selectedMeeting) => {
    let value = {
      id: selectedMeeting.id,
      title: selectedMeeting.title,
      locations: selectedMeeting.extendedProps.locations,
      description: selectedMeeting.extendedProps.description,
      attendees: selectedMeeting.extendedProps.attendees,
      privacyType: selectedMeeting.extendedProps.privacyType,
      documents: selectedMeeting.extendedProps.documents,
      startDate: new Date(selectedMeeting.start),
      startTime: new Date(selectedMeeting.start),
      endDate: new Date(selectedMeeting.end),
      endTime: new Date(selectedMeeting.end),
      recurringFreq: selectedMeeting.extendedProps.schedule.rrule.freq,
      recurringInterval: selectedMeeting.extendedProps.schedule.rrule.interval,
      recurringDtstart: new Date(selectedMeeting.extendedProps.schedule.rrule.dtstart),
      recurringUntil: selectedMeeting.extendedProps.schedule.rrule.until,
      recurringByweekday: selectedMeeting.extendedProps.schedule.rrule.byweekday,
      recurringBysetpos: selectedMeeting.extendedProps.schedule.rrule.bysetpos,
      recurringBymonthday: selectedMeeting.extendedProps.schedule.rrule.bymonthday

    };

    console.log("selectedEvent", value);
    navigate("/view/meeting", {state: value})
  }


  const viewMeeting = (selectedMeeting) => {
    console.log("selectedMeeting", selectedMeeting);
    prepareSelectedMeeting(selectedMeeting);
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
                    criteriaParams={criteriaParams}
                    dataUrl={`${host}/api/v1/meeting/fetchMeetingHistory`}
                    actionHandler={(e) => {
                      onDownload(e.data.id);
                      viewMeeting(e.data);
                    }}
          />
        </ul>
      </div>
    </div>
  );
};

export default MeetingHistory;
