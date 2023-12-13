import React, { Fragment, useEffect, useState } from 'react';
import {components} from 'react-select';
import {Form} from 'reactstrap';
import Button from '@material-ui/core/Button';
import TextField from '../customInput/TextField';
import DatePicker from '../customInput/DatePicker';
import CustomTimePicker from '../customInput/CustomTimePicker';
import AutoComplete from '../customInput/AutoComplete';
import Utils from '../../Utils';
import Avatar from '../avatar';
import {get, post} from '../../service/RestService';

import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import {useNavigate} from 'react-router-dom';
import {Checkbox, Switch} from '@material-ui/core';
import appManager from "../../../common/service/AppManager";
import AlertDialog from "../AlertDialog";
import SelectItem from "../customInput/SelectItem";
import moment from 'moment';

const ViewCase = (props) => {
  return <div style={{width: '100%', display: 'flex', padding: '32px'}} className={'caseContainer'}>
               <div style={{marginRight: '4px'}}>
                 <div className={'view-header row'}>
                   <div>COB Request - [ {props.selected.clientName} ]</div>
                 </div>
                 <div>

                 </div>
               </div>
             </div>
};

export default ViewCase;
