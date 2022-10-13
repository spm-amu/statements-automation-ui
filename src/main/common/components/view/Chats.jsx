import React from 'react';
// import { ipcRenderer } from 'electron';
import Button from '@material-ui/core/Button';
const { ipcRenderer } = window.require('electron');

const Chats = (props) => {
  const onDownload = (url) => {
    ipcRenderer.send('downloadFile', {
      payload: {
        fileURL: url
      }
    })
  }

  return (
    <>
      <Button onClick={(e) => { onDownload('https://www.africau.edu/images/default/sample.pdf')}}>
        DOWNLOAD FILE
      </Button>
    </>
  );
};

export default Chats;
