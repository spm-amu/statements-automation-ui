import React, {Fragment, useEffect, useState} from 'react';
import TextField from "../customInput/TextField";
import {DataGrid} from "../DataGrid";
import appManager from "../../service/AppManager";

const MultiTermCalculatorValuesForm = (props) => {

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
      <DataGrid config={grid}
                bodyMaxHeight={"65vh"}
                defaultOrderField={'start'}
                criteriaParams={criteriaParams}
                dataUrl={`${appManager.getAPIHost()}/statements/api/v1/cob/accounts/multiTermCalculatorValues/get/${props.accountNumber}`}
                actionHandler={(e) => {
                }}
      />
    </div>
  </div>
};

export default MultiTermCalculatorValuesForm;
