/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import Timer from "./Timer";
import {get, host, post} from "../../service/RestService";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import appManager from "../../service/AppManager";
import Icon from "../Icon";
import {IconButton} from "@material-ui/core";
import AlertDialog from "../AlertDialog";

const MeetingRoomToolbar = (props) => {

  const { isDirectCall, selectedMeeting } = props;
  const [endMeetingPromiseContext, setEndMeetingPromiseContext] = useState(null);
  const [started, setStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [remainingTime, setRemainingTime] = useState();

  const socketEventHandler = useState({});

  const handler = () => {
    return {
      get id() {
        return 'meeting-room-toolbar-' + selectedMeeting.id;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHANGE_HOST:
            updateHost(be);
            break;
        }
      }
    }
  };

  const updateHost = (args) => {
    let userDetails = appManager.getUserDetails();
    setIsHost(userDetails.userId === args.payload.host);
  };

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHANGE_HOST);
    setIsHost(props.isHost);
  }, []);

  useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const handleEndMeetingButton = (e) => {
    confirmEndMeeting().then((data) => {
      endMeeting();
    }, () => {
    });
  };

  const confirmEndMeeting = () => {
    return new Promise((resolve, reject) => {
      setEndMeetingPromiseContext({
        reject,
        resolve
      });
    });
  };

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
        endMeetingPromiseContext &&
        <AlertDialog title={'Warning'}
                     message={'Are you sure you want to end the meeting?'}
                     onLeft={() => {
                       endMeetingPromiseContext.reject();
                       setEndMeetingPromiseContext(null);
                     }}
                     onRight={() => {
                       endMeetingPromiseContext.resolve(endMeetingPromiseContext.data);
                       setEndMeetingPromiseContext(null);
                     }}
                     showLeft={true}
                     showRight={true}
                     btnTextLeft={'NO'}
                     btnTextRight={'YES'}
        />
      }
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
              onClick={(e) => handleEndMeetingButton()}
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
