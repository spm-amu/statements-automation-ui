import React from 'react';
import "./Form.css";
import AutoComplete from "./AutoComplete";
import IconButton from '@material-ui/core/IconButton';
import Icon from '../Icon'
import appManager from '../../service/AppManager'
import Utils from "../../Utils";
const { electron } = window;

const Files = React.memo(React.forwardRef((props, ref) => {

  const [files, setFiles] = React.useState(!props.value ? [] : props.value);

  const handleChange = () => event => {
    let targetFiles = event.target.files;

    console.log('########## : ', targetFiles);

    var allFiles = [];
    for (var i = 0; i < targetFiles.length; i++) {
      let file = targetFiles[i];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let fileInfo = {
          name: file.name,
          label: file.name,
          type: file.type,
          size: file.size,
          payload: reader.result
        };

        allFiles.push(fileInfo);
        if (allFiles.length === targetFiles.length) {
          let joined = files.concat(allFiles);
          setFiles(joined);

          if(props.valueChangeHandler) {
            props.valueChangeHandler(joined, props.id);
          }
        }
      };
    }
  };

  const onDownload = (documentId) => {

    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: `${appManager.getAPIHost()}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return <>
    <div className={'row'}>
      <div className={'col-*-*'} style={{marginLeft: '12px', width: '48px'}}>
        <input
          accept={"*/*"}
          id={`file-upload-input`}
          multiple={true}
          style={{display: 'none'}}
          onChange={handleChange()}
          type="file"
        />
        <label htmlFor={`file-upload-input`}>
          <IconButton
            component="span"
            aria-controls="menu-list-grow"
            aria-haspopup="true"
          >
            <Icon id={'ATTACH_FILE'}/>
          </IconButton>
        </label>
      </div>
      {
        files.length > 0 ?
          <div className={'col-*-*'} style={{padding: '8px 0 0 8px', width: 'calc(100% - 88px)'}}>
            <AutoComplete
              id={props.id}
              label={''}
              disabled={props.disabled}
              enableFile={props.enableFile}
              invalidText={''}
              value={files}
              multiple={!Utils.isNull(props.multiple) ? props.multiple : true}
              borderless={true}
              className={'files'}
              labelClickHandler={(option) => onDownload(option)}
              valueChangeHandler={(value, id) => {
                setFiles(value);
                props.valueChangeHandler(value, id);
              }}
            />
          </div>
          :
          null
      }
    </div>
  </>
}));

export default Files;
