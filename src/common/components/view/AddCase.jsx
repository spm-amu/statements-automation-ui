import React, {Fragment, useState} from 'react';
import {post} from "../../service/RestService";
import appManager from "../../service/AppManager";
import Button from "@material-ui/core/Button";
import Alert from "react-bootstrap/Alert";
import {Form} from 'reactstrap';
import TextField from "../customInput/TextField";

const AddCase = (props) => {

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [value] = useState({
    businessUnit: ''
  });

  const handleFormValueChange = (fieldValue, id, required) => {
    value[id] = fieldValue;
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  return <div style={{width: '100%', padding: '64px', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden'}} className={'view-container'}>
    <div style={{width: '100%',marginRight: '4px'}}>
      <div className={'view-header row'}>
        <div>Add new cob request</div>
      </div>
      <div className={'row w-100'}>
        <div className={'w-100'}>
          {
            message &&
            <Alert
              variant={messageType}
              show={true}
            >
              <p>{message}</p>
            </Alert>
          }
        </div>
      </div>
      <div className={'row'}>
        <div style={{width: '80%', margin: '16px 0'}}>
          <Form>
            <div>
              <TextField
                label="Business unit"
                id="businessUnit"
                required={true}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
                errorMessage={
                  'A business unit is required. Please enter a value'
                }
              />
            </div>
            <div>
              <TextField
                label="Client code"
                id="clientCode"
                required={true}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
                errorMessage={
                  'A client code is required. Please enter a value'
                }
              />
            </div>
            <div>
              <TextField
                label="CoB date"
                id="cobDate"
                required={true}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
                errorMessage={
                  'A statement date is required. Please enter a value'
                }
              />
            </div>
          </Form>
        </div>
      </div>
      <div className={'row'}>
        <Button
          style={{height: '36px', backgroundColor: 'rgb(175, 20, 75)', color: '#FFFFFF'}}
          onClick={(e) => {
            post(`${appManager.getAPIHost()}/statements/api/v1/cob/start`, (response) => {
              setCobFile("data:image/png;base64," + response.cobFile);
            }, (e) => {
            }, value, '', false);
          }}
        >
          SAVE
        </Button>
      </div>
    </div>
  </div>
};

export default AddCase;
