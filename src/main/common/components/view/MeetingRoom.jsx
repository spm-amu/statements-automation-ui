import {useState} from 'react';
import {X} from 'react-feather';
import {components} from 'react-select'
import {Form} from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import TimePicker from '../customInput/TimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Files from '../customInput/Files';
import Utils from '../../Utils';
import Avatar from '../avatar';
import {host, post, get} from "../../service/RestService";

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';

import {host} from "../../service/RestService";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import React from "react";
import MeetingSettingsComponent from "../vc/MeetingSettingsComponent";

const MeetingRoom = (props) => {
  const {selectedMeeting} = props;
  const {settings} = props;

  return (
    <div>
      JOINING MEETING
      <br />
      {
        JSON.stringify(selectedMeeting)
      }
      <br />
      <br />
      {
        JSON.stringify(settings)
      }
    </div>
  );
};

export default MeetingRoom;
