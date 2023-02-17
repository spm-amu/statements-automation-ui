import React, {useEffect} from 'react';
import "./Form.css";
import IconButton from '@material-ui/core/IconButton';
import Icon from '../Icon'
import {host} from "../../service/RestService";

const {electron} = window;

const Files = React.memo(React.forwardRef((props, ref) => {

  const [files, setFiles] = React.useState(!props.value ? [] : props.value);

  const handleChange = () => event => {
    let targetFiles = event.target.files;
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

          if (props.valueChangeHandler) {
            props.valueChangeHandler(joined, props.id);
          }
        }
      };
    }
  };

  useEffect(() => {
    setFiles([]);
  }, [props.clearUploadedFileSwitch]);

  const onDownload = (documentId) => {

    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: `${host}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return <>
    <div className={'row'} style={{alignItems: 'center', margin: '0', width: '100%'}}>
      <div className={'col-*-*'} style={{marginLeft: '0', width: '72px'}}>
        <input
          accept={props.style === 'IMAGE' ? "image/jpeg,image/gif,image/png,image/x-eps"
            : "image/*,application/*"}
          id={`file-upload-input`}
          multiple={false}
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
          <div className={'col-*-*'}
               style={{padding: '8px 0 16px 8px', width: 'calc(100% - 88px)', marginLeft: '-24px'}}>
            {
              files && files.length > 0 &&
              <div className={'row no-margin no-padding'}>
                <div>
                  <div className={'row no-margin file-label'}>
                    <div>{files[0].name}</div>
                    <div className={'close-button'} onClick={(e) => {
                      setFiles([]);
                      props.valueChangeHandler(null, props.id);
                    }}>x
                    </div>
                  </div>
                </div>
                <div className={'col spacer'}>&nbsp;</div>
              </div>
            }
          </div>
          :
          null
      }
    </div>
  </>
}));

export default Files;
