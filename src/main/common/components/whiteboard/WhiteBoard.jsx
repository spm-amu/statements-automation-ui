/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import './WhiteBoard.css';
import makeStyles from "@material-ui/core/styles/makeStyles";
import EventHandler from "./EventHandler";
import Utils from "../../Utils";
import Button from '@material-ui/core/Button';

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
  const [initializing, setInitializing] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [value, setValue] = React.useState(null);
  const [fileDialogOpen, setFileDialogOpen] = React.useState(false);
  const [templateType, setTemplateType] = React.useState(null);
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

  React.useEffect(() => {
  });

  const setup = () => {
    let container = document.getElementById('templateContainer');
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

    if(contentType) {
      headers['Content-Type'] = contentType;
    }
    return {
      method: method,
      headers: headers,
      body: data
    };
  }

  const api = () => {
    return {
      get id() {
        return props.config.id;
      },
      loadData: (actionConfig) => {
        setLoading(true);
        setLoading(false);
      },
      get model() {
        return value;
      },
      get value() {
        return value;
      }
    }
  };

  const handleOpen = () => {
    setFileDialogOpen(true);
  };

  const handleDelete = () => {
    let element = document.getElementById(selectedItem);
    element.parentElement.removeChild(element);

    setSelectedItem(null);
  };

  const handleSave = () => {
    let payload = document.getElementById("templateContainer").innerHTML.replace("<div name=\"replaced_html\", '<html'")
      .replace('</div>', '</html>').replace("<div name=\"replaced_body\"", '<body')
      .replace('</div>', '</body>').replace('2px dashed green', 'none');

    let templateData = {};
    templateData.templateType = templateType;
    templateData.payloadBase64 = btoa(payload);

    let fetchConfig = getFetchConfig(JSON.stringify(templateData), 'POST', 'application/json');
    let url = location + applicationContext.getBaseApiUrl() + props.config.templateStorageUrl;

    trackPromise(
      fetch(encodeURI(url), fetchConfig)
        .then(status)
        .then(json)
        .then((data) => {
          //alert('SAVE RESULT : ' + JSON.stringify(data));
        }).catch((e) => {
        if (e.code === 401) {
          applicationContext.clear();
          applicationContext.getApplicationHistory().push('/login');
        }
      })
    )
  };

  const handleOk = () => {
    let fetchConfig = getFetchConfig(null, 'GET');
    setFileDialogOpen(false);
    trackPromise(
      fetch(encodeURI(location + applicationContext.getBaseApiUrl() + props.config.metaDataUrl + '/' + templateType.id), fetchConfig)
        .then(status)
        .then(json)
        .then((data) => {
          let designData = JSON.parse(data);
          setDesignData(designData);
          setTemplateDoc(atob(designData.template.payloadBase64));
        }).catch(
        (e) => {
          if (e.code === 401) {
            applicationContext.clear();
            applicationContext.getApplicationHistory().push('/login');
          }
        })
    );
  };

  const handleClose = () => {
    setFileDialogOpen(false);
  };

  const loadDoc = (file) => {
    setTemplateDoc(null);

    let data = new FormData();
    data.append("sourceType", "PDF");
    data.append("targetType", "HTML");
    data.append("file", file);

    let fetchConfig = getFetchConfig(data, 'POST');
    let url = location + applicationContext.getBaseApiUrl() + props.config.documentConverterUrl;

    trackPromise(
      fetch(encodeURI(url), fetchConfig)
        .then(status)
        .then(json)
        .then((data) => {
          setTemplateDoc(data);
        }).catch((e) => {
        if (e.code === 401) {
          applicationContext.clear();
          applicationContext.getApplicationHistory().push('/login');
        }
      })
    )
  };

  let mouseClickHandler = function (event) {
    if(grabbedItem) {
      setSelectedItem(grabbedItem.id);
      eventHandler.handleGrabRelease(event,
        {
          id: grabbedItem.id,
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
                      designData.items.map((placeHolder) => {
                        return <div>
                          <Button
                            variant={'contained'}
                            size="large"
                            style={{width: '100%'}}
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
                    <div style={{height: "100%", width: '100%', border: '8px solid red', overflow: "auto"}}
                         className={'col-*-* __sys_placeholders'} id={"templateContainer"}
                    >
                    </div>
                  </div>
                </div>
                :
                null
            }
          </div>
      }
    </div>
  );
};

export default WhiteBoard;
