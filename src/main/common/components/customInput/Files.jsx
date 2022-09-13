import React from 'react';
import "./Form.css";
import AutoComplete from "./AutoComplete";
import IconButton from '@material-ui/core/IconButton';
import Icon from '../Icon'

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

          if(props.valueChangeHandler) {
            props.valueChangeHandler(joined, props.id);
          }
        }
      };
    }
  };

  return <>
    <div className={'row'}>
      <div className={'col-*-*'} style={{marginLeft: '12px', width: '48px'}}>
        <input
          accept={props.style === 'IMAGE' ? "image/jpeg,image/gif,image/png,image/x-eps"
            : "image/jpeg,image/gif,image/png,application/pdf,image/x-eps"}
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
          <div className={'col-*-*'} style={{padding: '8px 0 0 8px', width: 'calc(100% - 88px)'}}>
            <AutoComplete
              id={props.id}
              label={''}
              invalidText={''}
              value={files}
              multiple={true}
              borderless={true}
              className={'files'}
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




