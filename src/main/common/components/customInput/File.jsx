import React, {useEffect} from 'react';
import "./Form.css";
import IconButton from '@material-ui/core/IconButton';
import Icon from '../Icon'
import appManager from '../../service/AppManager'

const {electron} = window;

const File = React.memo(React.forwardRef((props, ref) => {

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
          location: file.path,
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
        fileURL: `${appManager.getAPIHost()}/api/v1/document/download/${documentId}`,
      },
    });
  };

  return <>
    <div className={'row'} style={{alignItems: 'center', margin: '0', width: '100%'}}>
      <div className={'col-*-*'} style={{marginLeft: '0', width: '72px'}}>
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
            <Icon id={'ATTACH_FILE'} color={props.iconColor ? props.iconColor : null}/>
          </IconButton>
        </label>
      </div>
      {
        files.length > 0 ?
          <div className={'col-*-*'}
               style={{padding: '8px 0 16px 8px', width: 'calc(100% - 88px)', marginLeft: '-24px'}}>
            {
              files && files.length > 0 &&
              files.map((file, index) => {
                return (
                  <div key={index} className={'row no-margin no-padding'}>
                    <div>
                      <div className={'row no-margin file-label'}>
                        <table>
                          <tbody>
                          <tr>
                            <td>{files[index].name}</td>
                            <td>
                              <div style={{float: 'right'}} className={'close-button'} onClick={(e) => {
                                for (const f of files) {
                                  if (files[index].name === f.name) {
                                    files.splice(index, 1);
                                    break;
                                  }
                                }

                                setFiles([].concat(files));

                                console.log('###: ', files);

                                const updatedFiles = files.length > 0 ? files : null;

                                props.valueChangeHandler(updatedFiles, props.id);
                              }}>x
                              </div>
                            </td>
                          </tr>
                          </tbody>

                        </table>
                        {/*<div style={{float: 'left'}}>
                      {files[0].name}
                    </div>
                    <div style={{float: 'right'}} className={'close-button'} onClick={(e) => {
                      setFiles([]);
                      props.valueChangeHandler(null, props.id);
                    }}>x
                    </div>*/}
                      </div>
                    </div>
                    <div className={'col spacer'}>&nbsp;</div>
                  </div>
                )
              })
            }
          </div>
          :
          null
      }
    </div>
  </>
}));

export default File;
