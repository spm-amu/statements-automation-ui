/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import './MeetingSession.css'
import Button from "@material-ui/core/Button";

const HOST_WAITING_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_MESSAGE = 'Waiting for the meeting host to let you in';


const Lobby = (props) => {
  const {
    waitingList
  } = props;

  return (
    <>
      {
        waitingList && waitingList.length > 0 &&
        <div style={{width: '320px', height: '100%', border: '1px solid #e1e1e1', borderRadius: '4px'}}>
          <div style={{fontSize: '24px', margin: '16px', borderBottom: '1px solid #e1e1e1'}}>
            Users requesting to join the call...
          </div>
          <div style={{fontSize: '16px', margin: '16px'}}>
            {waitingList.map((item, index) => {
              return <div key={index}>
                <div>

                </div>
                <div style={{margin: '16px 0 16px 0', borderBottom: '1px solid #e1e1e1', paddingBottom: '16px'}}
                     className={'row'}>
                  <div style={{margin: '8px 4px 0 0'}} className={'col'}>
                    {
                      item.user
                    }
                  </div>
                  <div style={{marginRight: '4px'}} className={'col-*-*'}>
                    <Button
                      style={{
                        backgroundColor: 'green',
                        color: '#FFFFFF'
                      }}
                      onClick={
                        (e) => {
                          props.acceptUserHandler(item)
                        }
                      }>
                      ACCEPT
                    </Button>
                  </div>
                  <div className={'col-*-*'}>
                    <Button
                      style={{
                        backgroundColor: 'red',
                        color: '#FFFFFF'
                      }}
                      onClick={
                        (e) => {
                          props.rejectUserHandler(item)
                        }
                      }>
                      REJECT
                    </Button>
                  </div>
                </div>
              </div>
            })}
          </div>
        </div>
      }
    </>
  );
};

export default Lobby;
