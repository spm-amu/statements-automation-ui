import React, {useEffect, useState} from 'react';

import Box from "@material-ui/core/Box";
import {Accordion, AccordionDetails, AccordionSummary, Tab} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import {useNavigate} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import {get, post} from "../../service/RestService";
import appManager from "../../service/AppManager";
import Utils from "../../Utils";
import AccountCOBValuesForm from "./AccountCOBValuesForm";
import StatementViewer from "../StatementViewer";
import Button from "@material-ui/core/Button";
import PDFViewer from "../PDFViewer";

const ViewCase = (props) => {

  const [cobFile, setCobFile] = useState(null);
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


  return <div style={{width: '100%', padding: '32px', maxHeight: '100%', overflowY: 'auto'}} className={'view-container'}>
    <div style={{width: '100%',marginRight: '4px'}} className={'row'}>
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
      <div className={'view-case-content'} style={{width: '100%'}}>
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
                  <div
                    style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #aaaaaa', borderRadius: '4px'}}>
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
                          <div className={'w-100 row'} style={{height: '400px', maxHeight: '400px', overflowY: 'auto'}}>
                            <div style={{width: '30%', paddingLeft: '28px'}}>
                              <div className={'row'} style={{marginBottom: '4px'}}>
                                <div>Status:</div>
                                <div className={'col'}>{account.status.replaceAll('_', ' ')}</div>
                              </div>
                              {
                                !Utils.isNull(account.cobValues) &&
                                <div className={'row'} style={{margin: '0 8px 32px 0'}}>
                                  <div className={'row'} style={{fontSize: '16px', fontWeight: 600}}>Certificate of
                                    Balance values
                                  </div>
                                  <div className={'row'}>
                                    <AccountCOBValuesForm data={account.cobValues} valueChangeHandler={(value) => {
                                      let cobValue = cobValues.filter((val) => val.accountNumber === value.accountNumber);

                                      //if(value)

                                    }}/>
                                  </div>
                                </div>
                              }
                            </div>
                            <div className={'col'}>
                              {account.statements.map((statement, i) => (
                                <Accordion key={i}>
                                  <AccordionSummary
                                    expandIcon={<Icon id={'CHEVRON_DOWN'} color='rgb(175, 20, 75)'/>}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                  >
                                    <Typography>{statement.EndDate}</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails style={{width: '100%', padding: '32px 64px'}}>
                                    <StatementViewer data={statement}/>
                                  </AccordionDetails>
                                </Accordion>
                              ))}
                            </div>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                  <div style={{width: '100%', padding: '16px'}} className={'row'}>
                    <div style={{width: '100%'}}>
                      <Button
                        style={{height: '36px', backgroundColor: '#4BB543'}}
                        onClick={(e) => {
                          post(`${appManager.getAPIHost()}/statements/api/v1/cob/generate`, (response) => {
                            setCobFile("data:image/png;base64," + response.cobFile);
                          }, (e) => {
                          }, {
                            referenceNumber: props.selected.id,
                            accounts: []
                          }, '', false);
                        }}
                      >
                        GENERATE COB
                      </Button>
                    </div>
                    <div style={{width: '100%'}}>
                      {
                        cobFile &&
                        <PDFViewer pdf={cobFile}/>
                      }
                    </div>
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
