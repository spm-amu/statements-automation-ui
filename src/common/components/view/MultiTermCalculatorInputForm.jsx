import React, {useEffect, useState} from 'react';
import {DataGrid} from "../DataGrid";
import appManager from "../../service/AppManager";
import {get} from "../../service/RestService";
import Utils from "../../Utils";

const grid = {
  "id": "multiTermCalculatorValues",
  "columns": [
    {
      "type": "gridColumn",
      "id": "formattedTransactionDate",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Date",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "balance",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Balance",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "interestRate",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Interest rate",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "transactionTotal",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Transaction total",
        "sortable": true
      }
    },
    {
      "type": "gridColumn",
      "id": "accruedInterestAmount",
      "attributes": {
        "filterable": false,
        "width": "20.0%",
        "label": "Accrued Interest",
        "sortable": true
      }
    }
  ],
  "pageSize": 15
};

const MultiTermCalculatorInputForm = (props) => {

  const [value, setValue] = useState(props.data);
  const [calculatorInput, setCalculatorInput] = useState();

  useEffect(() => {
    let url = `${appManager.getAPIHost()}/statements/api/v1/cob/accounts/multiTermCalculatorValues/get/${props.accountNumber}`;
    get(url, (response) => {
      setCalculatorInput(response);
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
      {
        calculatorInput &&
        <>
          <DataGrid config={grid}
                    rowTextColorEvaluator={(row) => {
                      return new Date(row.transactionDate).getTime() === new Date(calculatorInput.cobDate).getTime() ?
                        'blue' : new Date(row.transactionDate).getTime() < new Date(calculatorInput.cobDate).getTime() ? '#4BB543' : 'red';
                    }}
                    rows={calculatorInput.lines.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))}
                    bodyMaxHeight={"65vh"}
                    defaultOrderField={'start'}
                    actionHandler={(e) => {
                    }}
          />
          <div style={{width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'right'}}>
            Total {calculatorInput.totalAccruedInterest}</div>
        </>
      }
      {
        Utils.isNull(calculatorInput) &&
        <div style={{color: '#4BB543', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          No calculator values available
        </div>
      }
    </div>
  </div>
};

export default MultiTermCalculatorInputForm;
