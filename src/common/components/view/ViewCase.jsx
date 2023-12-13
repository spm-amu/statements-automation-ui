import React, {useEffect, useState} from 'react';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import Box from "@material-ui/core/Box";
import {Accordion, AccordionDetails, AccordionSummary, Tab} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import {useNavigate} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import {get} from "../../service/RestService";
import appManager from "../../service/AppManager";
import Utils from "../../Utils";
import AccountCOBValuesForm from "./AccountCOBValuesForm";

const ViewCase = (props) => {

  const [tabValue, setTabValue] = useState('1');
  const [caseQueryData, setCaseQueryData] = useState(null);
  const [cobValues, setCOBValues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    get(`${appManager.getAPIHost()}/statements/api/v1/cob/query/${props.selected.id}`, (response) => {
      setCaseQueryData(response);
    }, (e) => {
    }, '', false);
  }, []);

  const handleChange = (e, newValue) => {
    setTabValue(newValue);
  };

  return <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'view-container'}>
    <div style={{width: '100%',marginRight: '4px'}}>
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
                <Tab label="Case Details" value="1"/>
                <Tab label="Certificate of Balance" value="2"/>
              </TabList>
            </Box>
            <TabPanel value="1">
              <div className={'card'} style={{padding: '32px', width: '100%'}}>
                <div className={'row'} style={{marginBottom: '4px'}}>
                  <div>Client code:</div>
                  <div className={'col'}>{props.selected.clientCode}</div>
                </div>
                <div className={'row'} style={{marginBottom: '8px'}}>
                  <div>Status:</div>
                  <div className={'col'}>{props.selected.status}</div>
                </div>
                <div className={'row'} style={{marginBottom: '8px'}}>
                  <div>Name:</div>
                  <div className={'col'}>{props.selected.clientName}</div>
                </div>
                <div className={'row'} style={{marginBottom: '8px'}}>
                  <div>ID number:</div>
                  <div className={'col'}>{props.selected.clientIDNumber}</div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="2">
              {
                props.selected.status === 'READY' && !Utils.isNull(caseQueryData) &&
                <div>
                  <div style={{fontSize: '20px', marginBottom: '16px'}}>Accounts</div>
                  <div style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #aaaaaa', borderRadius: '4px'}}>
                    {caseQueryData.accounts.map((account, i) => (
                      <Accordion key={i}>
                        <AccordionSummary
                          expandIcon={<Icon id={'CHEVRON_DOWN'} color='rgb(175, 20, 75)'/>}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>{account.accountNumber + " (" + account.accountType + ")"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div className={'w-100 row'} style={{border: '2px solid red', height: '400px', maxHeight: '400px', overflowY: 'auto'}}>
                            <div style={{width: '30%', border: '2px solid green', paddingLeft: '28px'}}>
                              <div className={'row'} style={{marginBottom: '4px'}}>
                                <div>Status:</div>
                                <div className={'col'}>{account.status.replaceAll('_', ' ')}</div>
                              </div>
                              {
                                !Utils.isNull(account.cobValues) &&
                                <div className={'row'} style={{marginBottom: '8px'}}>
                                  <div>Certificate of Balance values</div>
                                  <div className={'col'}>
                                    <AccountCOBValuesForm valueChangeHandler={(value) => {
                                      let cobValue = cobValues.filter((val) => val.accountNumber === value.accountNumber);

                                      //if(value)

                                    }}/>
                                  </div>
                                </div>
                              }
                            </div>
                            <div className={'col'} style={{border: '2px solid blue'}}></div>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                </div>
              }
              {
                (props.selected.status !== 'READY' || !caseQueryData) &&
                <div style={{color: '#FF9494', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  Certificate of Balance values for this case is not currently available
                </div>
              }
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  </div>
};

export default ViewCase;
