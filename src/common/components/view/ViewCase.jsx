import React, {useState} from 'react';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import Box from "@material-ui/core/Box";
import {Tab, Tabs} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import {useNavigate} from "react-router-dom";
const ViewCase = (props) => {

  const [tabValue, setTabValue] = useState('1');
  const navigate = useNavigate();

  const handleChange = (e, newValue) => {
    setTabValue(newValue);
  };

  return <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'view-container'}>
    <div style={{marginRight: '4px'}}>
      <div className={'view-header row'}>
        <div>COB Request - [ {props.selected.clientName} ]</div>
        <div>
          <IconButton
            style={{color: '#01476C', width: '36px', height: '36px'}}
            onClick={(e) => {
              navigate('/view/caseList');
            }}
          >
            <Icon id={'CLOSE'} color={'rgb(175, 20, 75)'}/>
          </IconButton>
        </div>
      </div>
      <div className={'view-case-content'}>
        <Box sx={{width: '100%', typography: 'body1'}}>
          <TabContext value={tabValue}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
              <TabList onChange={handleChange} aria-label="">
                <Tab label="Case Details" value="1" />
                <Tab label="Certificate of Balance" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <div className={'card'} style={{padding: '32px', width: '100%'}}>
                <div className={'row'} style={{marginBottom: '4px'}}>
                  <div className={'col'}>Reference number: </div>
                  <div className={'col'}>{props.selected.id}</div>
                </div>
                <div className={'row'} style={{marginBottom: '8px'}}>
                  <div className={'col'}>Name: </div>
                  <div className={'col'}>{props.selected.clientName}</div>
                </div>
                <div className={'row'} style={{marginBottom: '8px'}}>
                  <div className={'col'}>ID number: </div>
                  <div className={'col'}>{props.selected.clientIDNumber}</div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="2">Item Two</TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  </div>
};

export default ViewCase;
