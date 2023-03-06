/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './WhiteBoard.css';
import makeStyles from "@material-ui/core/styles/makeStyles";
import EventHandler from "./EventHandler";
import Utils from "../../Utils";
import Button from '@material-ui/core/Button';
import appManager from "../../service/AppManager";
import {MessageType, SystemEventType} from "../../types";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import socketManager from "../../service/SocketManager";
import {post} from '../../service/RestService';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  errorMessageDisplay: {
    color: 'red'
  },
  propertyWindow: {
    height: "400px",
    margin: "4px",
    borderRadius: "4px",
    paddingLeft: "24px",
    borderBottom: "1px solid #e1e1e1",
    borderTop: "1px solid #e1e1e1"
  },
  paletteButton: {
    width: "270px",
    height: "40px",
    backgroundColor: "#e1e1e1",
    margin: "4px",
    textAlign: "center",
    padding: "28px 0",
    borderRadius: "4px"
  },
  paletteButtonSelected: {
    '&:hover': {
      backgroundColor: "yellowgreen"
    },
    width: "270px",
    height: "40px",
    backgroundColor: "yellowgreen",
    margin: "4px",
    textAlign: "center",
    padding: "28px 0",
    borderRadius: "4px"
  },
  palette: {
    width: "280px",
    borderRadius: "4px",
    border: "1px solid #e1e1e1"
  }
}));

const status = (response) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    let error = new Error(response.statusText);
    error.code = response.status;

    return Promise.reject(error);
  }
};

const json = (response) => {
  return response.text();
};

const eventHandler = new EventHandler();
const location = window.location.protocol + "//" + window.location.hostname;

const WhiteBoard = (props) => {
  const classes = useStyles();
  const idCounter = useRef(0);
  const [systemEventHandler] = useState({});
  const [socketEventHandler] = useState({});
  const [designData] = React.useState({
    items: [
      {
        placeHolder: 'TEXT_FIELD',
        description: "Text",
        placeHolderType: "TEXT_FIELD"
      }
    ]
  });
  const [grabbedItem, setGrabbedItem] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'whiteboard-socket-event-handler-api';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.SYSTEM_EVENT:
            handleSocketSystemEvent(be.payload);
            break;
        }
      }
    }
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'whiteboard-system-event-handler-api';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.WHITEBOARD_EVENT_ARRIVED:
            handleEvent(be);
            break;
        }
      }
    }
  };

  const handleSocketSystemEvent = (payload) => {
    if (payload.systemEventType === "WHITEBOARD_ITEM_EDIT_START") {
      console.log("SOCKET SYSTEM EVENT : ", payload);
    } else if (payload.systemEventType === "WHITEBOARD_ITEM_EDIT_START") {
      console.log("SOCKET SYSTEM EVENT : ", payload);
    }
  };

  const itemFocusHandler = (item, focused) => {
    props.eventHandler.onSystemEvent(focused ? "WHITEBOARD_ITEM_EDIT_START" : "WHITEBOARD_ITEM_EDIT_START_END",
      {
        itemId: item.id,
        editor: appManager.getUserDetails().name
      }
    )
  };

  const handleEvent = (data) => {
    switch (data.eventType) {
      case "INPUT_VALUE_CHANGE":
        eventHandler.updateInputItemValue(data.metadata);
        props.eventHandler.onUpdateItem(data.metadata);
        break;
      case "ADD_INPUT_FIELD":
        //data.metadata.style.top = (50 + parseFloat(data.metadata.style.top.replace('px', ''))) + 'px';
        eventHandler.createNode(data.metadata, (id) => {
          setSelectedItem(id);
        }, itemFocusHandler, props.readOnly);

        props.eventHandler.onAddItem(data.metadata);
        break;
      case "MOVE_ITEM":
        //data.metadata.clientY = data.metadata.clientY + 50;
        let item = document.getElementById(data.metadata.id);
        eventHandler.moveItem(item, data.metadata);
        props.eventHandler.onUpdateItem(data.metadata);
        break;
      case "DELETE_ITEM":
        deleteItem(data.metadata.id);
        props.eventHandler.onDeleteItem(data.metadata);
        break;
    }
  };

  useEffect(() => {
    systemEventHandler.api = systemEventHandlerApi();
    socketEventHandler.api = socketEventHandlerApi();
  });

  React.useEffect(() => {
    appManager.addSubscriptions(systemEventHandler, SystemEventType.WHITEBOARD_EVENT_ARRIVED);
    socketManager.addSubscriptions(socketEventHandler, MessageType.SYSTEM_EVENT);

    eventHandler.setId(props.id);

    for (const item of props.items) {
      eventHandler.createNode(item, (id) => {
        setSelectedItem(id);
      }, itemFocusHandler, props.readOnly);
    }

    return () => {
      appManager.removeSubscriptions(systemEventHandler);
      socketManager.removeSubscriptions(socketEventHandler);
    };
  }, []);

  const setup = () => {
    let container = document.getElementById('workspaceContainer');
    if (!Utils.isNull(container) && !props.readOnly) {
      eventHandler.initDragAndDrop((id, node) => {
        setSelectedItem(id);
      }, container);
    }
  };

  React.useEffect(() => {
    setup()
  });

  function getFetchConfig(data, method, contentType = null) {
    const accessToken = sessionStorage.getItem("accessToken");
    const idToken = sessionStorage.getItem("idToken");

    let headers = {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + accessToken,
      'idToken': idToken
    };

    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return {
      method: method,
      headers: headers,
      body: data
    };
  }

  const deleteItem = (id) => {
    let element = document.getElementById(id);
    if (element) {
      element.parentElement.removeChild(element);
    }
  };

  const handleDelete = () => {
    deleteItem(selectedItem);
    setSelectedItem(null);

    socketManager.emitEvent(MessageType.WHITEBOARD_EVENT, {
      userId: appManager.getUserDetails().userId,
      metadata: {
        id: selectedItem
      },
      eventType: "DELETE_ITEM"
    })
  };

  const handleSave = () => {
    post(
      `${appManager.getAPIHost()}/api/v1/meeting/whiteboard/save`,
      (response) => {
      },
      (e) => {
      },
      {
        data: JSON.stringify({
          items: props.items
        }),
        id: props.id
      },
      'Whiteboard data saved successfully',
      false
    );
  };

  let mouseClickHandler = function (event) {
    if (grabbedItem) {
      setSelectedItem(grabbedItem.id);
      eventHandler.handleGrabRelease(event,
        {
          id: window.btoa(appManager.getUserDetails().userId) + "-" + idCounter.current++,
          width: 400,
          height: 48,
          description: grabbedItem.description,
          type: grabbedItem.placeHolderType,
          table: grabbedItem.table
        }, (id) => {
          setSelectedItem(id);
        }, (item) => {
          props.eventHandler.onAddItem(item);
        }, itemFocusHandler);
    }

    setGrabbedItem(null);
  };

  const handleChange = () => event => {
    let files = event.target.files;
    loadDoc(files[0]);
  };

  const grabPalleteItem = (item) => {
    document.getElementsByTagName("body")[0].style.cursor = 'grabbing';
    setGrabbedItem(item);
  };

  return (
    <div style={{width: '100%', height: '100%'}}>
      {
        <div style={{width: '100%', height: '100%'}}>
          {
            designData ?
              <>
                <div style={{height: '64px'}}>
                  <IconButton component="span"
                              disabled={selectedItem === null || props.readOnly}
                              variant={'contained'}
                              style={{color: 'white'}}
                              size="large"
                              onClick={handleDelete}
                  >
                    <Icon id={'DELETE'}/>
                  </IconButton>
                  {
                    props.isHost && !props.readOnly &&
                    <IconButton component="span"
                                disabled={props.items.length === 0}
                                variant={'contained'}
                                style={{color: 'white'}}
                                size="large"
                                onClick={handleSave}
                    >
                      <Icon id={'SAVE'}/>
                    </IconButton>
                  }
                </div>
                <div className={"row"} style={{
                  width: '100%',
                  height: 'calc(100% - 64px)',
                  marginTop: '8px',
                  marginLeft: '0'
                }}>
                  <div style={{
                    width: '280px',
                    minWidth: '280px',
                  }} className={'col-*-*'}>
                    {
                      designData.items.map((placeHolder, index) => {
                        return <div>
                          <Button
                            variant={'contained'}
                            disabled={props.readOnly}
                            size="large"
                            style={{width: '100%'}}
                            key={index}
                            className={grabbedItem && grabbedItem.placeHolder === placeHolder.placeHolder ? classes.paletteButtonSelected : classes.paletteButton}
                            onClick={() => grabPalleteItem(placeHolder)}
                          >
                            {
                              placeHolder.description
                            }
                          </Button>
                        </div>
                      })
                    }
                  </div>
                  <div style={{
                    border: "1px solid #e1e1e1",
                    borderRadius: "4px",
                    margin: "4px 12px",
                    height: "100%",
                    width: "calc(100% - 310px)",
                    backgroundColor: '#FFFFFF'
                  }} className={'col-*-* dropTarget'}
                       onClick={(e) => mouseClickHandler(e)}>
                    <canvas style={{height: "100%", width: '100%', overflow: "auto"}}
                            className={'col-*-*'} id={"workspaceContainer"}
                    >
                    </canvas>
                  </div>
                </div>
              </>
              :
              null
          }
        </div>
      }
    </div>
  );
};

export default WhiteBoard;
