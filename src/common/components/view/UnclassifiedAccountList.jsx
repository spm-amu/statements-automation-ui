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
  "id": "unclassifiedAccountList",
  "columns": [
    {
      "type": "gridColumn",
      "id": "accountNumber",
      "attributes": {
        "filterable": true,
        "filterValueTemplate": "%${value}%",
        "width": "40.0%",
        "label": "AccountNumber",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "status",
      "attributes": {
        "filterable": false,
        "width": "30.0%",
        "label": "Status",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "viewActions",
      "attributes": {
        "label": "Actions",
        "filterable": false,
        "width": "30.0%",
        "toolbar": {
          "items": [
            {
              "id": "retryAccount",
              "type": "iconButton",
              "icon": "REPLAY"
            }
          ]
        },
        "sortable": false
      }
    }
  ],
  "pageSize": 15
};

const UnclassifiedAccountList = (props) => {

  const navigate = useNavigate();

  const retryAccount = (selectedAccount) => {
    alert('RETRY FIREEEE');
  };

  return (
    <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'view-container'}>
      <div style={{marginRight: '4px'}}>
        <div className={'view-header row'} style={{paddingLeft: '12px'}}>
          <div>Accounts</div>
        </div>
        <DataGrid config={grid}
                  bodyMaxHeight={"25vh"}
                  defaultOrderField={'start'}
                  rows={props.data}
                  actionHandler={(e) => {
                    if (e.id === 'retryAccount') {
                      retryAccount(e.data);
                    }
                  }}
        />
      </div>
    </div>
  );
};

export default UnclassifiedAccountList;
