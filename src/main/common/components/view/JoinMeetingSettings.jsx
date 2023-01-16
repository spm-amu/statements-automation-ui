import React, {useEffect, useState} from "react";
import WhiteBoard from "../whiteboard/WhiteBoard";
import socketManager from "../../service/SocketManager";
import {MessageType} from "../../types";
import {SystemEventType} from "../../types";
import appManager from "../../../common/service/AppManager";
import Button from "@material-ui/core/Button";

const JoinMeetingSettings = (props) => {

  const [eventHandler] = useState({});
  const [whiteboardItems] = useState([]);
  const [open, setOpen] = useState(true);

  const handler = () => {
    return {
      get id() {
        return 'test-whiteboard';
      },
      get participants() {
        return participants;
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.WHITEBOARD_EVENT:
            appManager.fireEvent(SystemEventType.WHITEBOARD_EVENT_ARRIVED, be.payload);
            break;
        }
      }
    }
  };

  useEffect(() => {
    eventHandler.api = handler();
  });

  useEffect(() => {
    socketManager.addSubscriptions(eventHandler, MessageType.WHITEBOARD_EVENT);
    return () => {
      socketManager.removeSubscriptions(eventHandler);
    };
  }, []);

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto'}}>
      <Button
        variant={'contained'}
        size="large"
        style={{width: '100%'}}
        onClick={() => setOpen(!open)}
      >
        SHOW / HIDE
      </Button>
      {
        open &&
        <WhiteBoard items={whiteboardItems} eventHandler={
          {
            onAddItem: (item) => {
              whiteboardItems.push(item);
            },
            onDeleteItem: (item) => {
              let filtered = whiteboardItems.filter((i) => i.id !== item.id);
              whiteboardItems.splice(0, whiteboardItems.length);

              for (const filteredElement of filtered) {
                whiteboardItems.push(filteredElement);
              }
            },
            onUpdateItem: (item) => {
              let filtered = whiteboardItems.filter((i) => i.id === item.id);
              if(filtered.length > 0) {
                const properties = Object.getOwnPropertyNames(item);
                for (const property of properties) {
                  filtered[0][property] = item[property];
                }
              }
            }
          }
        }/>
      }
    </div>
  );
};

export default JoinMeetingSettings;
