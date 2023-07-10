import React from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import "./Files.css";
import './Views.css';
import packageJson from '../../../../../release/app/package.json';

const Help = (props) => {

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: '32px'}} className={'row no-margin'}>
      <div style={{ marginRight: '4px', overflowY: 'hidden', height: '72px' }} className={'row w-100 no-margin no-padding'}>
          <div className={'view-header row w-100 no-margin no-padding'}>Help Centre</div>
          <div className={'row no-margin no-padding w-100'}>
            Version: <span style={{ fontWeight: 600 }}> { `v${packageJson.version}` } </span>
          </div>
      </div>
      <div className={'w-100 row no-margin no-padding'} style={{padding: '16px 0', height: 'calc(100% - 72px)'}}>
        <div className={'view-sub-header centered-flex-box w-100 row w-100 no-margin no-padding'} style={{height: '32px', fontSize: '32px', marginBottom: '16px'}}>Frequently asked questions</div>
        <div className={'view-sub-header w-100 row no-margin no-padding'}
             style={{maxHeight: 'calc(100% - 32px)', height: 'calc(100% - 32px)', overflow: 'auto', fontSize: '32px', margin: '16px 0'}}>
          <div  className={'w-100 row no-margin no-padding faq-heading centered-flex-box'}>
            <h3>Schedule a Meeting</h3>
          </div>
          <div  className={'w-100 row no-margin no-padding faq-heading centered-flex-box'}>
            <h3>Joining a meeting</h3>
          </div>
          <div  className={'w-100 row no-margin no-padding faq-heading centered-flex-box'}>
            <h3>Participating in a meeting</h3>
          </div>
          <div  className={'w-100 row no-margin no-padding faq-heading centered-flex-box'}>
            <h3>Recording Meeting</h3>
          </div>
          <div  className={'w-100 row no-margin no-padding faq-heading centered-flex-box'}>
            <h3>Troubleshooting</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
