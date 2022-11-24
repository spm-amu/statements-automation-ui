import React, {useState} from 'react';
import {host} from '../../service/RestService';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import {DataGrid} from "../DataGrid";
import SearchBar from "../SearchBar";
import "./Files.css";

const { electron } = window;

const grid = {
  "id": "designationList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "documentName",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "35.0%",
        "label": "Name",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "createdDate",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Created Date",
        "sortable": false
      }
    },
    {
      "type": "gridColumn",
      "id": "origin",
      "attributes": {
        "filterable": false,
        "width": "35.0%",
        "label": "Origin",
        "sortable": false
      }
    },
   {
      "type": "gridColumn",
      "id": "actions",
      "attributes": {
        "filterable": false,
        "width": "10.0%",
        "label": "",
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

const Files = (props) => {
  const [userDocuments, setUserDocuments] = useState([]);
  const [criteriaParams, setCriteriaParams] = useState({});
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
            <h3>Files</h3>
          </li>
          <div className={'searchbar'}>
            <SearchBar onSearch={(searchValue) => {
              setCriteriaParams({
                documentName: searchValue
              })
            }}/>
          </div>
          <DataGrid config={grid}
                    criteriaParams={criteriaParams}
                    dataUrl={`${host}/api/v1/document/fetchUserDocuments`}
                    actionHandler={(e) => {
                         onDownload(e.data.documentId);
                    }}
          />
        </ul>
      </div>
    </div>
  );
};

export default Files;
