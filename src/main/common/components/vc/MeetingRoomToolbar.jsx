/* eslint-disable react-hooks/exhaustive-deps */
import React, {Fragment, useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import Timer from "./Timer";
import {host, post} from "../../service/RestService";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import appManager from "../../service/AppManager";

const MeetingRoomToolbar = (props) => {

  const {isHost, isDirectCall, selectedMeeting} = props;
  const [started, setStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState();

  const endMeeting = () => {
    if(isHost) {
      socketManager.emitEvent(MessageType.END_MEETING, {
        meetingId: selectedMeeting.id,
        userId: appManager.getUserDetails().userId
      })
    }
  };

  useEffect(() => {
    if (remainingTime) {
      setStarted(true);
    }
  }, [remainingTime]);

  const startMeeting = (e) => {
    const data = {
      meetingId: selectedMeeting.id,
      end: selectedMeeting.endDate
    };

    post(
      `${host}/api/v1/meeting/start`,
      (response) => {
        setRemainingTime(response.remainingTime);
      },
      (e) => {
      },
      data,
      '',
      true
    );
  };

  return (
      <div>
        {
          !started && isHost && !isDirectCall &&
          <div className={'row'} style={{margin: '0 0 0 0'}}>
            <Button
              variant={'contained'}
              size="large"
              color={'primary'}
              onClick={(e) => startMeeting(e)}
            >
              START MEETING
            </Button>
          </div>
        }
        {
          started && isHost && !isDirectCall &&
          <div className={'row'} style={{margin: '0 0 0 0'}}>
            <div className={'col no-margin no-padding'}>
              <Button
                variant={'contained'}
                size="large"
                color={'primary'}
                onClick={(e) => endMeeting()}
              >
                END MEETING
              </Button>
            </div>
            <div className={'col no-margin'}>
              <Timer onTimeLapse={
                (extend) => {
                  if (!extend) {
                    endMeeting();
                  }
                }
              } time={remainingTime}/>
            </div>
          </div>
        }
      </div>
  );
};

export default MeetingRoomToolbar;
