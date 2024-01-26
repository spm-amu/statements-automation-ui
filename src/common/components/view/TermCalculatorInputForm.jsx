import React, {Fragment, useEffect, useState} from 'react';
import TextField from "../customInput/TextField";
import appManager from "../../service/AppManager";
import {get} from "../../service/RestService";
import DatePicker from "../customInput/DatePicker";

const TermCalculatorInputForm = (props) => {

  const [value, setValue] = useState({});

  useEffect(() => {
    let url = `${appManager.getAPIHost()}/statements/api/v1/cob/accounts/termCalculatorValues/get/${props.accountNumber}/${props.referenceNumber}`;
    get(url, (response) => {
      setValue(response);
    }, (e) => {
    }, '', false);
  }, []);

  useEffect(() => {
    props.valueChangeHandler(value, props.accountNumber);
  }, [value]);

  const handleFormValueChange = (fieldValue, id, required) => {
    setValue({...value, [id]: fieldValue});
  };

  const formValueChangeHandler = (e) => {
    handleFormValueChange(e.target.value, e.target.id, e.target.required);
  };

  return <div className={'card'} style={{padding: '32px', width: '100%'}}>
    <div style={{marginBottom: '4px'}} className={'row'}>
      <div className={'field-container'}>
        <TextField
          style={{width: '100%'}}
          label="Interest rate"
          id="interestRate"
          required={true}
          value={value.interestRate}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'An interest rate value is required. Please enter a value'
          }
        />
      </div>
      <div className={'field-container'}>
        <TextField
          style={{width: '100%'}}
          label="Capital amount"
          id="capitalAmount"
          required={true}
          value={value.capitalAmount}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'A capital value is required. Please enter a value'
          }
        />
      </div>
      <div className={'field-container'}>
        <DatePicker
          style={{width: '100%'}}
          label="Open date"
          id="openDate"
          required={true}
          value={value.openDate}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'Open date value is required. Please enter a value'
          }
        />
      </div>
      <div className={'field-container'}>
        <DatePicker
          style={{width: '100%'}}
          label="Mature date"
          id="matureDate"
          required={true}
          value={value.matureDate}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'Mature date value is required. Please enter a value'
          }
        />
      </div>
    </div>
  </div>
};

export default TermCalculatorInputForm;
