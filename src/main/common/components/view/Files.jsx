import React, { useEffect, useState } from 'react';
import { get, host } from '../../service/RestService';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import Download from '@material-ui/icons/CloudDownload';
const { electron } = window;

const Files = (props) => {
  const [userDocuments, setUserDocuments] = useState([]);

  const loadUserDocuments = () => {
    get(
      `${host}/api/v1/document/fetchUserDocuments`,
      (userDocumentList) => {
        console.log('userDocumentList', userDocumentList);
        setUserDocuments(userDocumentList);
      },
      (e) => {}
    );
  };

  const onDownload = (documentId) => {
    electron.ipcRenderer.sendMessage('downloadFile', {
      payload: {
        fileURL: `${host}/api/v1/document/download/${documentId}`,
      },
    });
  };

  useEffect(() => {
    loadUserDocuments();
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', margin: '16px 0' }}>
      <div style={{ marginRight: '4px' }}>
        <ul>
          <li>
            <h3>Files</h3>
          </li>
          {userDocuments.map((data) => (
            <li key={data.documentId}>
              <Download onClick={() => onDownload(`${data.documentId}`)} />
              &nbsp;{data.documentName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Files;
