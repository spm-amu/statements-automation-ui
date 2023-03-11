/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import Timer from "./Timer";
import {get, post} from "../../service/RestService";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import appManager from "../../service/AppManager";
import Icon from "../Icon";
import {IconButton} from "@material-ui/core";
import AlertDialog from "../AlertDialog";
import LottieIcon from '../LottieIcon';

const MeetingRoomToolbar = (props) => {

  const { isDirectCall, selectedMeeting } = props;
  const [endMeetingPromiseContext, setEndMeetingPromiseContext] = useState(null);
  const [started, setStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState();

  const [socketEventHandler] = useState({});

  const handler = () => {
    return {
      get id() {
        return 'meeting-room-toolbar-' + selectedMeeting.id;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.CHANGE_HOST:
            onUpdateHost(be);
            break;
          case MessageType.TOGGLE_RECORD_MEETING:
            onRecording(be.payload);
            break;
        }
      }
    }
  };

  const onUpdateHost = (args) => {
    let userDetails = appManager.getUserDetails();
    setIsHost(userDetails.userId === args.payload.host);
  };

  const onRecording = (args) => {
    if (selectedMeeting.id === args.roomID) {
      setIsRecording(args.isRecording);
    }
  };

  useEffect(() => {
    socketEventHandler.api = handler();
  });

  useEffect(() => {
    socketManager.addSubscriptions(socketEventHandler, MessageType.CHANGE_HOST, MessageType.TOGGLE_RECORD_MEETING);
    socketManager.emitEvent(MessageType.POLL_RECORDING_STATUS, {
      roomID: selectedMeeting.id
    }).catch((error) => {
    });

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
      }).catch((error) => {
      });

      get(
        `${appManager.getAPIHost()}/api/v1/meeting/end/${selectedMeeting.id}`,
        (response) => {
        },
        (e) => {
        },
        '',
        true
      );
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
      `${appManager.getAPIHost()}/api/v1/meeting/start`,
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
      <div className={'row'} style={{margin: '0 0 0 0', display: 'flex', alignItems: 'center'}}>
        {
          isHost && !isDirectCall &&
          <>
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
          </>
        }
        {
          isRecording &&
          <>
            <LottieIcon id={'recording'}/>
            <span style={{ fontSize: '16px' }}>
              {
                isHost ? 'You are recording...' : 'Meeting is being recorded...'
              }
            </span>
          </>
        }
      </div>
    </div>
  );
};

export default MeetingRoomToolbar;
