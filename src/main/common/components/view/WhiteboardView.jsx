import React, {useEffect, useState} from "react";
import WhiteBoard from "../whiteboard/WhiteBoard";
import {get} from "../../service/RestService";
import appManager from '../../service/AppManager'
import Button from "@material-ui/core/Button";
import {useNavigate} from 'react-router-dom';

const WhiteboardView = (props) => {

  const [whiteboardItems, setWhiteboardItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const close = () => {
    navigate("/view/meetingHistory");
  };

  useEffect(() => {
    get(`${appManager.getAPIHost()}/api/v1/meeting/whiteboard/get/${props.id}`, (response) => {
      if (response) {
        setWhiteboardItems(response.items);
      }
      setLoading(false);
    }, (e) => {

    }, '', false)
  }, []);

  return (
    <div style={{maxHeight: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto', padding: '32px'}}>
      <div className="toolbar row">
        <Button
          onClick={close}
          variant={'text'}
          size="large"
          style={{color: '#985F31', border: '1px solid #985F31'}}
        >
          CLOSE
        </Button>
      </div>
      {
        whiteboardItems &&
        <div style={{padding: '4px'}}>
          <WhiteBoard isHost={false} readOnly={true} id={props.id} items={whiteboardItems}/>
        </div>
      }
      {
        whiteboardItems === null && !loading &&
        <div className={'centered-flex-box'} style={{width: '90%', height: '90%'}}>No whiteboard</div>
      }
    </div>
  );
};

export default WhiteboardView;
