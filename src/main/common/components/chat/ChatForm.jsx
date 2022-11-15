import React, {useState} from 'react';
import './ChartForm.css';
import Utils from "../../Utils";
import Files from "../view/Meeting";
import {Form} from "reactstrap";
import TextField from "../customInput/TextField";
import {host, post} from "../../service/RestService";
import AutoComplete from "../customInput/AutoComplete";
import Button from "@material-ui/core/Button";
import appManager from "../../service/AppManager";

const ChatForm = (props) => {
  const [selectedMeeting, setSelectedMeeting] = useState(props.selectedMeeting);
  const [title, setTitle] = useState(null);
  const [participants, setParticipants] = useState([]);

  const handleAdd = () => {
    let chat = {
      title: title,
      participants: participants,
      messages: []
    };

    let userDetails = appManager.getUserDetails();

    chat.participants.push({
      emailAddress: userDetails.emailAddress,
      name: userDetails.name,
      phoneNumber: userDetails.phoneNumber,
      userId: userDetails.userId
    });

    post(
      `${host}/api/v1/chat/create`,
      (response) => {
        props.addHandler(chat);
      },
      (e) => {},
      chat,
      "The chat details have been saved successfully"
    );
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
          <TextField
            label="Title"
            id="title"
            required={true}
            value={title}
            valueChangeHandler={(e) => setTitle(e.target.value)}
            errorMessage={
              'A chat title is required. Please enter a value'
            }
          />
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
