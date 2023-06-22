/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import Button from '../RegularButton';

const HOST_WAITING_MESSAGE = 'Waiting for others to join';
const ATTENDEE_WAITING_MESSAGE = 'Waiting for the meeting host to let you in';


const LobbyWaitingList = (props) => {
  const {
    waitingList
  } = props;

  return (
    <>
      {
        waitingList && waitingList.length > 0 &&
        <div style={{width: '320px', height: props.autoHeight ? null : '100%', border: '1px solid #e1e1e1', borderRadius: '4px', color: '#1d253b', backgroundColor: '#ffffff', overflow: 'hidden'}}>
          <div style={{fontSize: '20px', margin: '16px', borderBottom: '1px solid #e1e1e1'}}>
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
                      color={'success'}
                      style={{
                        color: '#FFFFFF',
                        width: '80px'
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
                      color={'danger'}
                      style={{
                        color: '#FFFFFF',
                        width: '80px'
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

export default LobbyWaitingList;
