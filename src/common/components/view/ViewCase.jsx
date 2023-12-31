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
import Alert from "react-bootstrap/Alert";

const ViewCase = (props) => {

  const [cobFile, setCobFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateErrorMessage, setGenerateErrorMessage] = useState(null);
  const [tabValue, setTabValue] = useState('1');
  const [caseQueryData, setCaseQueryData] = useState(null);
  const [cobAccounts, setCobAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    get(`${appManager.getAPIHost()}/statements/api/v1/cob/query/${props.selected.id}`, (response) => {
      setCaseQueryData(response);
      setCobAccounts(response.accounts);
    }, (e) => {
    }, '', false);
  }, []);

  useEffect(() => {
    for (const cobAccount of cobAccounts) {
      if(!cobAccount.cobValues) {
        cobAccount.cobValues = {};
      }
    }
  }, [cobAccounts]);

  const handleChange = (e, newValue) => {
    setTabValue(newValue);
  };


  return <div style={{width: '100%', padding: '32px', maxHeight: '100%', overflowY: 'auto'}}
              className={'view-container'}>
    <div style={{width: '100%', marginRight: '4px'}} className={'row'}>
      <div className={'view-header row'}>
        <div style={{marginLeft: '12px'}}>COB Request - [ {props.selected.clientName} ]</div>
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
                    style={{border: '1px solid #aaaaaa', borderRadius: '4px'}}>
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
                          <div className={'w-100 row'} style={{overflowY: 'auto', whiteSpace: 'nowrap'}}>
                            <div style={{width: '300px', paddingLeft: '28px'}}>
                              <div className={'row'} style={{marginBottom: '4px'}}>
                                <div>Status:</div>
                                <div className={'col field-value'}>{account.status.replaceAll('_', ' ')}</div>
                              </div>
                              {
                                !Utils.isNull(account.cobValues) &&
                                <div className={'row'} style={{margin: '0 8px 32px 0'}}>
                                  <div className={'row'} style={{fontSize: '16px', fontWeight: 600}}>Certificate of
                                    Balance values
                                  </div>
                                  <div className={'row'}>
                                    <AccountCOBValuesForm accountNumber={account.accountNumber} data={account.cobValues}
                                                          valueChangeHandler={(value, accountNumber) => {
                                                            let find = cobAccounts.filter((val) => val.accountNumber === accountNumber);
                                                            let cobAccount;

                                                            if (find.length === 0) {
                                                              cobAccount = {};
                                                              cobAccount.accountNumber = account.accountNumber;
                                                              cobAccounts.push(cobAccount);
                                                            } else {
                                                              cobAccount = find[0];
                                                            }

                                                            if(!cobAccount.cobValues) {
                                                              cobAccount.cobValues = {};
                                                            }

                                                            cobAccount.cobValues.interestRate = value.interestRate;
                                                            cobAccount.cobValues.capital = value.capital;
                                                            cobAccount.cobValues.netAccruedInterest = value.netAccruedInterest;
                                                            cobAccount.cobValues.totalBalance = value.totalBalance;

                                                            console.log("COB ACCOUNT : ", cobAccount);
                                                          }}/>
                                  </div>
                                </div>
                              }
                            </div>
                            <div style={{width: 'calc(100% - 308px)', marginLeft: '8px'}}>
                              <div>Statements</div>
                              <div>
                                {account.statements.map((statement, i) => (
                                  <Accordion key={i}>
                                    <AccordionSummary
                                      expandIcon={<Icon id={'CHEVRON_DOWN'} color='rgb(175, 20, 75)'/>}
                                      aria-controls="panel1a-content"
                                      id="panel1a-header"
                                    >
                                      <Typography>{statement.EndDate}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <StatementViewer data={statement}/>
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </div>
                              {account.statements.length === 0 &&
                                <div style={{height: '90%', color: '#FF9494', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                  NO STATEMENTS FOUND FOR ACCOUNT
                                </div>
                              }
                            </div>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                  <div style={{width: '100%', padding: '16px'}} className={'row'}>
                    <div style={{width: '100%'}}>
                      {
                        generateErrorMessage &&
                        <Alert
                          variant={'danger'}
                          show={true}
                        >
                          <p>{generateErrorMessage}</p>
                        </Alert>
                      }
                      <Button
                        disabled={generating}
                        style={{height: '36px', backgroundColor: 'rgb(175, 20, 75)', color: '#FFFFFF'}}
                        onClick={(e) => {
                          setGenerating(true);
                          setGenerateErrorMessage(null);
                          post(`${appManager.getAPIHost()}/statements/api/v1/cob/generate`, (response) => {
                            setGenerating(false);
                            setCobFile("data:image/png;base64," + response.cobFile);
                          }, (e) => {
                            setGenerating(false);
                            setGenerateErrorMessage("A system error has occurred while generating COB file");
                          }, {
                            referenceNumber: props.selected.id,
                            accounts: cobAccounts
                          }, '', false);
                        }}
                      >
                        {generating && (
                          <i
                            className="fa fa-refresh fa-spin"
                            style={{ marginRight: '8px' }}
                          />
                        )}
                        {generating && <span>LOADING...</span>}
                        {!generating && <span>GENERATE COB</span>}
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
