import React, {useState} from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import "./Files.css";
import './Views.css';
import packageJson from '../../../../../release/app/package.json';
import PDFViewer from '../PDFViewer';
import manualPDF from '../../../../../sample.pdf';

const Help = (props) => {

  return (
    <div style={{ width: '100%', display: 'flex', padding: '32px' }}>
      <div style={{ marginRight: '4px', overflowY: 'auto' }}>
          <div className={'view-header'}>Help Centre</div>
          <p>Everything you need to know about Armscor Connect</p>
          <hr style={{ borderTop: '2px dotted #3f51b5' }}/>
          <p>
            Version: <span style={{ fontWeight: 'bold' }}> { `v${packageJson.version}` } </span>
          </p>
          <div className={'view-sub-header'}>User manual</div>
          <PDFViewer pdf={manualPDF} />
      </div>
    </div>
  );
};

export default Help;
