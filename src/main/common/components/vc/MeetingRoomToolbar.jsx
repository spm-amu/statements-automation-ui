/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import Timer from "./Timer";
import {host, post} from "../../service/RestService";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import appManager from "../../service/AppManager";
import Icon from "../Icon";
import {IconButton} from "@material-ui/core";

const MeetingRoomToolbar = (props) => {

  const {isHost, isDirectCall, selectedMeeting} = props;
  const [started, setStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState();

  const endMeeting = () => {
    if (isHost) {
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
        isHost && !isDirectCall &&
        <div className={'row'} style={{margin: '0 0 0 0', display: 'flex', alignItems: 'center'}}>
          <div style={{margin: '0 8px 0 0'}}>
            <IconButton
              variant={'contained'}
              disabled={started}
              size="large"
              color={'primary'}
              onClick={(e) => startMeeting(e)}
            >
              <Icon id={'PLAY'}/>
            </IconButton>
            <IconButton
              variant={'contained'}
              disabled={!started}
              size="large"
              color={'primary'}
              onClick={(e) => endMeeting()}
            >
              <Icon id={'STOP'}/>
            </IconButton>
          </div>
          <div className={'col no-margin'}>
            {
              started &&
              <Timer onTimeLapse={
                (extend) => {
                  if (!extend) {
                    endMeeting();
                  }
                }
              } time={remainingTime}/>
            }
          </div>
        </div>
      }
    </div>
  );
};

export default MeetingRoomToolbar;
