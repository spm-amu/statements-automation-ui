/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import './WhiteBoard.css';
import makeStyles from "@material-ui/core/styles/makeStyles";
import EventHandler from "./EventHandler";
import Utils from "../../Utils";
import Button from '@material-ui/core/Button';
import appManager from "../../../common/service/AppManager";
import {MessageType, SystemEventType} from "../../types";
import IconButton from "@material-ui/core/IconButton";
import Icon from "../Icon";
import socketManager from "../../service/SocketManager";

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
  const [designData, setDesignData] = React.useState({
    items: [
      {
        placeHolder: 'TEXT_FIELD',
        description: "Text",
        placeHolderType: "TEXT_FIELD"
      }
    ]
  });
  const [templateDoc, setTemplateDoc] = React.useState(null);
  const [grabbedItem, setGrabbedItem] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);
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

  const handleEvent = (data) => {
    switch (data.eventType) {
      case "INPUT_VALUE_CHANGE":
        eventHandler.updateInputItemValue(data.metadata);
        break;
      case "ADD_INPUT_FIELD":
        data.metadata.id = data.metadata.id + '-test';
        data.metadata.style.top = (50 + parseFloat(data.metadata.style.top.replace('px', ''))) + 'px';
        eventHandler.createNode(data.metadata, (id) => {
          setSelectedItem(id);
        }, true);
        break;
      case "MOVE_ITEM":
        data.metadata.id = data.metadata.id + '-test';
        data.metadata.clientY = data.metadata.clientY + 50;
        let item = document.getElementById(data.metadata.id);
        eventHandler.moveItem(item, data.metadata);
        break;
      case "DELETE_ITEM":
        deleteItem(data.metadata.id + '-test');
        break;
    }
  };

  useEffect(() => {
    systemEventHandler.api = systemEventHandlerApi();
  });

  React.useEffect(() => {
    appManager.addSubscriptions(systemEventHandler, SystemEventType.WHITEBOARD_EVENT_ARRIVED);
    return () => {
      appManager.removeSubscriptions(systemEventHandler);
    };
  }, []);

  const setup = () => {
    let container = document.getElementById('workspaceContainer');
    if (!Utils.isNull(container)) {
      eventHandler.initDragAndDrop((id, node) => {
        setSelectedItem(id);
      }, container);
    }
  };

  React.useEffect(() => {
    setup()
  });

  React.useEffect(() => {
    setup()
  }, [templateDoc]);

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
    element.parentElement.removeChild(element);
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
        });
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
    <div>
      {
        <div>
          {
            designData ?
              <>
                <IconButton component="span"
                            disabled={selectedItem === null}
                            variant={'contained'}
                            size="large"
                            onClick={handleDelete}
                >
                  <Icon id={'DELETE'}/>
                </IconButton>
                <IconButton component="span"
                            disabled={!templateDoc}
                            variant={'contained'}
                            size="large"
                            onClick={handleSave}
                >
                  <Icon id={'SAVE'}/>
                </IconButton>
                <div className={"row"} style={{
                  width: '100%',
                  height: '72vh',
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
                    marginLeft: "8px",
                    height: "100%",
                    width: "calc(100% - 288px)"
                  }} className={'col-*-* dropTarget'}
                       onClick={(e) => mouseClickHandler(e)}>
                    <canvas style={{height: "100%", width: '100%', border: '8px solid red', overflow: "auto"}}
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
