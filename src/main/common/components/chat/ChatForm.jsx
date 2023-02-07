import React, {useState} from 'react';
import './ChartForm.css';
import {Form} from "reactstrap";
import {host, post} from "../../service/RestService";
import AutoComplete from "../customInput/AutoComplete";
import Button from "@material-ui/core/Button";
import appManager from "../../service/AppManager";

const ChatForm = (props) => {
  const [participants, setParticipants] = useState([]);

  const handleAdd = () => {
    props.addHandler(participants);
  };

  return (
    <div
      className={'chart-form'}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: '32px',
        backgroundColor: '#FFFFFF',
        marginTop: '2px',
      }}
    >
      <h5 className={"title"}>
        Add chat
      </h5>
      <Form>
        <div>
          <div style={{ marginTop: '8px' }}>
            <AutoComplete
              id="participants"
              label={'Participants'}
              invalidText={'invalid participants'}
              value={participants}
              multiple={true}
              showImages={true}
              searchAttribute={'emailAddress'}
              validationRegex={/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/}
              valueChangeHandler={(value, id) => {
                setParticipants(value);
              }}
              optionsUrl={`${host}/api/v1/auth/search`}
            />
          </div>
        </div>
      </Form>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'left',
          margin: '16px 0',
        }}
      >
        <div style={{ marginRight: '4px' }}>
          <Button
            onClick={(e) => handleAdd()}
            variant={'contained'}
            size="large"
            color={'primary'}
          >
            SAVE
          </Button>
        </div>
      </div>
    </div>
  )
};


export default ChatForm;
