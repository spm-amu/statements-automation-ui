import React, {Fragment, useEffect, useState} from 'react';
import TextField from "../customInput/TextField";

const AccountCOBValuesForm = (props) => {

  const [value, setValue] = useState(props.data);

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
          disabled
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
          label="Capital"
          id="capital"
          disabled
          required={true}
          value={value.capital}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'A capital value is required. Please enter a value'
          }
        />
      </div>
      <div className={'field-container'}>
        <TextField
          style={{width: '100%'}}
          label="Nett accrued interest"
          id="netAccruedInterest"
          disabled
          required={true}
          value={value.netAccruedInterest}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'A nett accrued interest value is required. Please enter a value'
          }
        />
      </div>
      <div className={'field-container'}>
        <TextField
          style={{width: '100%'}}
          label="Total balance"
          id="totalBalance"
          disabled
          required={true}
          value={value.totalBalance}
          valueChangeHandler={(e) => formValueChangeHandler(e)}
          errorMessage={
            'A total balance interest value is required. Please enter a value'
          }
        />
      </div>
    </div>
  </div>
};

export default AccountCOBValuesForm;
