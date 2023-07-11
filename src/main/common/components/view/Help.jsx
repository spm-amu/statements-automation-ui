import React from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import "./Help.css";
import './Views.css';
import packageJson from '../../../../../release/app/package.json';

const Help = (props) => {

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', padding: '32px'}} className={'row no-margin'}>
      <div style={{marginRight: '4px', overflowY: 'hidden', height: '72px'}}
           className={'row w-100 no-margin no-padding'}>
        <div className={'help-view-header view-header row w-100 no-margin'}>Armscor
          Connect {`v${packageJson.version}`}</div>
      </div>
      <div className={'w-100 row no-margin no-padding'} style={{padding: '16px 0', height: 'calc(100% - 72px)'}}>
        <div className={'view-sub-header w-100 row w-100 no-margin no-padding'}
             style={{height: '32px', fontSize: '32px', marginBottom: '16px'}}>Frequently asked questions
        </div>
        <div className={'help-content row'}>
          <div className={'w-100 row no-margin no-padding'}>
            <div className={'w-100 row no-margin no-padding faq-heading'}>
              <span>Schedule a Meeting</span>
            </div>
            <div className={'w-100 row no-margin no-padding'}>
              <ul className={'first-level-headings'}>
                <li>How do I create/schedule a new meeting?</li>
                <ul className={'second-level-headings'}>
                  <li>Log in using your Net0/ AD credentials</li>
                  <li>From the navigation bar, click on the Calendar tab <img
                    src={require('../../assets/img/calendar-tab.png')} alt={''} style={{width: '64px'}}/></li>
                  <li>Click on the space on the desired date* and a new screen should appear <br/> <img
                    src={require('../../assets/img/calendar-date.png')} alt={''}
                    style={{height: '128px', margin: '16px'}}/></li>
                  <li>Capture in all necessary meeting details (Subject , Time , Attendees , Location , Meeting
                    description and submit by clicking the send button <br/><img
                      src={require('../../assets/img/add-meeting.png')} alt={''}
                      style={{height: '320px', margin: '16px'}}/></li>
                </ul>
                <li>Does Connect allow me to update or edit a scheduled meeting?</li>
                <span className={'faq-text'}>Yes, only as a host</span>
                <ul className={'second-level-headings'}>
                  <li>Within the Calendar tab, click on the scheduled meeting and a popup infomation card will appear <br/><img
                    src={require('../../assets/img/meeting-popup-menu.png')} alt={''} style={{height: '200px', margin: '16px'}}/> <br />Click on the arrow on the top right hand corner, and more meeting details will appear</li>
                  <li>Edit the desired fields and then click the Send Update button <img
                    src={require('../../assets/img/meeting-sent-update.png')} alt={''} style={{width: '64px'}}/> when done</li>
                </ul>
                <li>Can I add more attendees to a live meeting?</li>
                <li>How do I end a meeting before its scheduled end time?</li>
              </ul>
            </div>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <span>Joining a meeting</span>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <span>Participating in a meeting</span>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <span>Recording Meeting</span>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <span>Troubleshooting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
