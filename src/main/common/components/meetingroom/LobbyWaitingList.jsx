/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import Button from '../RegularButton';
import Icon from "../Icon";
import IconButton from "@material-ui/core/IconButton";

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
        <div style={{width: '320px', height: props.autoHeight ? null : '100%', borderRadius: '4px', color: '#ffffff', backgroundColor: 'rgb(40, 40, 43)', overflow: 'hidden'}}>
          <div style={{fontSize: '20px', margin: '16px'}}>
            Users requesting to join
          </div>
          <div style={{fontSize: '16px', margin: '16px'}}>
            {waitingList.map((item, index) => {
              return <div key={index}>
                <div>

                </div>
                <div style={{margin: '16px 0 16px 0', paddingBottom: '16px'}}
                     className={'row'}>
                  <div style={{margin: '10px 4px 0 0'}} className={'col'}>
                    {
                      item.userName
                    }
                  </div>
                  <div style={{marginRight: '4px'}} className={'col-*-*'}>
                    <IconButton
                      onClick={
                        (e) => {
                          props.acceptUserHandler(item)
                        }
                      }
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      <Icon id={'CHECK'} color={'#4caf50'}/>
                    </IconButton>
                  </div>
                  <div className={'col-*-*'}>
                    <IconButton
                      onClick={
                        (e) => {
                          props.rejectUserHandler(item)
                        }
                      }
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      <Icon id={'CLOSE'} color={'#f44336'}/>
                    </IconButton>
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
