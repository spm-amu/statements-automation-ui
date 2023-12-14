import React, {Fragment} from 'react';

const AccountCOBValuesForm = (props) => {
  return <div className={'card'} style={{padding: '32px', width: '100%'}}>
    <div className={'row'} style={{marginBottom: '4px'}}>
      <div>Interest rate:</div>
      <div className={'col'}>{props.data.interestRate}</div>
    </div>
    <div className={'row'} style={{marginBottom: '8px'}}>
      <div>Capital:</div>
      <div className={'col'}>{props.data.capital}</div>
    </div>
    <div className={'row'} style={{marginBottom: '8px'}}>
      <div>Nett accrued interest:</div>
      <div className={'col'}>{props.data.netAccruedInterest}</div>
    </div>
    <div className={'row'} style={{marginBottom: '8px'}}>
      <div>Total balance:</div>
      <div className={'col'}>{props.data.totalBalance}</div>
    </div>
  </div>
};

export default AccountCOBValuesForm;
