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
                <span className={'faq-text'}>Yes, only as a host</span>
                <ul className={'second-level-headings'}>
                  <li>During the meeting, click the People button <img
                    src={''} alt={''} style={{width: '64px'}}/></li>
                  <li>Click the Request to join button <img
                    src={''} alt={''} style={{width: '64px'}}/> and search the specific user. </li>
                  <li>Click the Call button, if their status shows as online, i.e. a green indicator. </li>
                </ul>
                <li>How do I end a meeting before its scheduled end time?</li>
                <span className={'faq-text'}>Yes, only as a host</span>
                <ul className={'second-level-headings'}>
                  <li>Click the End meeting button <img
                    src={''} alt={''} style={{width: '64px'}}/></li>
                  <li>Alternatively, click the Hang up button <img
                    src={''} alt={''} style={{width: '64px'}}/> to leave the meeting. </li>
                </ul>
                <li>Can I remove a participant?</li>
                <ul className={'second-level-headings'}>
                  <li>Right click on the particular participant, then select remove participant</li>
                </ul>
              </ul>
            </div>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <div className={'w-100 row no-margin no-padding faq-heading'}>
              <span>Joining a meeting</span>
            </div>
            <div className={'w-100 row no-margin no-padding'}>
              <ul className={'first-level-headings'}>
                <li>How do I join the meeting from the meeting invite? (Armscor Outlook)</li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Join Meeting <img
                    src={''} alt={''} style={{width: '64px'}}/> link, a pop-up screen requesting you to choose the platform to join from.  </li>
                  <li>Log in with your Net0/AD credentials, click the Join <img
                    src={''} alt={''} style={{width: '64px'}}/> button.</li>
                  <li>Alternatively, log in using your Net0/ AD credentials and click on the scheduled meeting and then click on the Join <img
                    src={''} alt={''} style={{width: '64px'}}/> button. </li>
                </ul>
                <li>Joining the meeting as an external attendee? (Private email)</li>
                <ul className={'second-level-headings'}>
                  <li>Click the Join Meeting <img
                    src={''} alt={''} style={{width: '64px'}}/> link, select Join from browser <img
                    src={''} alt={''} style={{width: '64px'}}/>.  </li>
                  <li>Capture/Input the log in credentials provided by the meeting invite and click the Join <img
                    src={''} alt={''} style={{width: '64px'}}/> button</li>
                </ul>
              </ul>
            </div>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <div className={'w-100 row no-margin no-padding faq-heading'}>
              <span>Participating in a meeting</span>
            </div>
            <div className={'w-100 row no-margin no-padding'}>
              <ul className={'first-level-headings'}>
                <li>Can I raise a hand during a meeting? </li>
                <ul className={'second-level-headings'}>
                  <li>Yes, by clicking on the Hand  <img
                    src={''} alt={''} style={{width: '64px'}}/> icon to raise your hand.  </li>
                </ul>
                <li>How do I share my screen?</li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Share screen  <img
                    src={''} alt={''} style={{width: '64px'}}/> icon. </li>
                </ul>
                <li>How do I turn my video feed on/ off? </li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Video icon <img
                    src={''} alt={''} style={{width: '64px'}}/> , when its red its off however if its greyed out you have your video feed on. </li>
                </ul>
                <li>How can I mute my audio? </li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Microphone icon <img
                    src={''} alt={''} style={{width: '64px'}}/> , when its red the feed is off however if it’s greyed out you have your audio feed on. </li>
                </ul>
              </ul>
            </div>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <div className={'w-100 row no-margin no-padding faq-heading'}>
              <span>Recording Meeting</span>
            </div>
            <div className={'w-100 row no-margin no-padding'}>
              <ul className={'first-level-headings'}>
                <li>How do I record a meeting?  </li>
                <ul className={'second-level-headings'}>
                  <li>During the meeting, the host can click on the Record button  <img
                    src={''} alt={''} style={{width: '64px'}}/> and then the button turns red (The solution will alert the host and other attendees that recording has started, throughout the meeting there will be a flashing dot).  </li>
                </ul>
                <li>Where do I find my recording?  </li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Meeting History    <img
                    src={''} alt={''} style={{width: '64px'}}/> tab, from the meeting list click on the Download button under recording to relevant meeting title and save the recording. </li>
                </ul>
                <li>How to end recording?  </li>
                <ul className={'second-level-headings'}>
                  <li>Click on the Record button   <img
                    src={''} alt={''} style={{width: '64px'}}/> again, and then it will show option to end the recording then red flash will disappear. </li>
                  <li>An alert will pop up indicating that the recording has been saved. </li>
                </ul>
              </ul>
            </div>
          </div>
          <div className={'w-100 row no-margin no-padding faq-heading'}>
            <div className={'w-100 row no-margin no-padding faq-heading'}>
              <span>Troubleshooting</span>
            </div>
            <div className={'w-100 row no-margin no-padding'}>
              <ul className={'first-level-headings'}>
                <li>I can’t join a meeting  </li>
                <ul className={'second-level-headings'}>
                  <li>Please check network connection . </li>
                  <li>Check the URL from the meeting invite . </li>
                  <li>Check if you are correctly logged into the solution.  </li>
                </ul>
                <li>My camera is not working  </li>
                <ul className={'second-level-headings'}>
                  <li>Check the camera settings on your machine. </li>
                </ul>
                <li>My Speaker is not working  </li>
                <ul className={'second-level-headings'}>
                  <li>Check the audio settings on your machine, volume % as well </li>
                </ul>
                <li>Attendees cannot hear see the screen being shared?  </li>
                <ul className={'second-level-headings'}>
                  <li>Restart the screen sharing.  </li>
                </ul>
                <li>I cannot see my recording and polling results.    </li>
                <ul className={'second-level-headings'}>
                  <li>Wait for about 2 minutes for the system to generate the recording and polling results.  </li>
                </ul>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
