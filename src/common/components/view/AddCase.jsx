import React, {Fragment, useEffect, useState} from 'react';
import {get, post} from "../../service/RestService";
import appManager from "../../service/AppManager";
import Button from "@material-ui/core/Button";
import Alert from "react-bootstrap/Alert";
import {Form} from 'reactstrap';
import TextField from "../customInput/TextField";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import {useNavigate} from "react-router-dom";
import DatePicker from "../customInput/DatePicker";
import Utils from "../../Utils";

const AddCase = (props) => {

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [messageType, setMessageType] = useState(null);
  const [value, setValue] = useState({});
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    setFormValid(!Utils.isNull(value.businessUnit) && !Utils.isNull(value.cobDate) && !Utils.isNull(value.clientCode));
  }, [value]);

  const handleFormValueChange = (fieldValue, id, required) => {
    setEdited(true);
    setValue({...value, [id]: fieldValue ? fieldValue.trim() : ''});
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  return <div style={{width: '100%', padding: '64px', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden'}} className={'view-container'}>
    <div style={{width: '100%',marginRight: '4px'}}>
      <div className={'view-header row'}>
        <div>Add new cob request</div>
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
                value={value.businessUnit}
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
                value={value.clientCode}
                valueChangeHandler={(e) => formValueChangeHandler(e)}
                errorMessage={
                  'A client code is required. Please enter a value'
                }
              />
            </div>
            <div>
              <DatePicker
                label="CoB date"
                id="cobDate"
                value={value.cobDate}
                required={true}
                valueChangeHandler={(date, id) =>
                  handleFormValueChange(date.toLocaleDateString('en-GB').split('/').reverse().join('-'), id, true)
                }
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
          disabled={!edited || !formValid}
          style={{height: '36px', backgroundColor: 'rgb(175, 20, 75)', color: '#FFFFFF'}}
          onClick={(e) => {
            setSaving(true);
            post(`${appManager.getAPIHost()}/statements/api/v1/cob/start`, (response) => {
              if(response.status === 'SUCCESS') {
                setMessage('The case has been submitted successfully');
                setMessageType('success');
                setEdited(false);
              } else {
                setMessage(response.message);
                setMessageType('danger');
              }

              setSaving(false);
            }, (e) => {
            }, value, '', false);
          }}
        >
          {saving && (
            <i
              className="fa fa-refresh fa-spin"
              style={{ marginRight: '8px' }}
            />
          )}
          {saving && <span>LOADING...</span>}
          {!saving && <span>SAVE</span>}
        </Button>
      </div>
    </div>
  </div>
};

export default AddCase;
