import React, {useState} from 'react';
import {get} from "../../service/RestService";
import SearchBar from "../SearchBar";
import {DataGrid} from "../DataGrid";
import {useNavigate} from "react-router-dom";
import appManager from "../../service/AppManager";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import './Views.css';

const {electron} = window;

const grid = {
  "id": "caseList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "clientCode",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "25.0%",
        "label": "Client code",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "clientName",
      "attributes": {
        "filterable": false,
        "width": "40.0%",
        "label": "Client name",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "status",
      "attributes": {
        "filterable": false,
        "width": "15.0%",
        "label": "Case status",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "viewActions",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "View case",
        "toolbar": {
          "items": [
            {
              "id": "viewCase",
              "type": "iconButton",
              "icon": "LINK"
            }
          ]
        },
        "sortable": false
      }
    }
  ],
  "pageSize": 15
};

const CaseList = (props) => {

  const [criteriaParams, setCriteriaParams] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const getSelectedCaseEvent = (selectedCase) => {
    get(`${appManager.getAPIHost()}/statements/api/v1/cob/case/get/${selectedCase.id}`, (response) => {
      navigate("/view/viewCase", {state: response})
    }, (e) => {
    }, '', false);
  };

  const viewCase = (selectedCase) => {
    getSelectedCaseEvent(selectedCase);
  };

  return (
    <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'caseContainer'}>
      <div style={{marginRight: '4px'}}>
        <div className={'view-header row'}>
          <div>Cases</div>
          <div>
            <IconButton
              style={{color: '#01476C', width: '36px', height: '36px'}}
              onClick={(e) => {
                navigate('addCase');
              }}
            >
              <Icon id={'ADD'} color={'rgb(175, 20, 75)'}/>
            </IconButton>
          </div>
        </div>
        <div className={'searchbar'}>
          <SearchBar onSearch={(searchValue) => {
            setCriteriaParams({
              clientCode: searchValue
            })
          }}/>
        </div>
        <DataGrid config={grid}
                  bodyMaxHeight={"65vh"}
                  defaultOrderField={'start'}
                  criteriaParams={criteriaParams}
                  dataUrl={`${appManager.getAPIHost()}/statements/api/v1/cob/case/list`}
                  actionHandler={(e) => {
                    if (e.id === 'viewCase') {
                      viewCase(e.data);
                    }
                  }}
        />
      </div>
    </div>
  );
};

export default CaseList;
