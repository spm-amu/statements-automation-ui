import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {CardText, CardTitle, Col, Row,} from 'reactstrap';
import '../../../assets/scss/page-authentication.scss';
import Button from '../../RegularButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import {host, get, post} from '../../../service/RestService';
import styles from './LoginStyle';
import CustomInput from '../../customInput/CustomInput';
import {Face} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import appManager from "../../../../common/service/AppManager";
import {isSafari, isChrome, isEdge} from 'react-device-detect';
import {ACCESS_TOKEN_PROPERTY, REFRESH_TOKEN_PROPERTY} from "../../../service/TokenManager";
import Utils from "../../../Utils";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const {electron} = window;

const ExternalMeetingAttendee = (props) => {

  const [username, setUsername] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMeetingRedirect, setIsMeetingRedirect] = React.useState(false);
  const [redirectData, setRedirectData] = React.useState(null);
  const [usernameState, setUsernameState] = React.useState('');
  const [passwordState, setPasswordState] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const clearErrorStates = () => {
    setUsernameState('');
    setErrorMessage('');
  };

  useEffect(() => {

    clearErrorStates();
  }, []);

  const redirectToMeeting = () => {

    clearErrorStates();

    if (username === '') {
      setUsernameState('error');
    }

    if (username) {
      setIsLoading(true);
    }

    // get(`${host}/api/v1/meeting/fetch/${meetingID}`, (response) => {
    //   let userDetails = appManager.getUserDetails();
    //   let isHost = false;
    //   response.extendedProps.attendees.forEach(att => {
    //     if (att.userId === userDetails.userId) {
    //       isHost = att.type === 'HOST';
    //     }
    //   });
    //
    //   navigate("/view/meetingRoom", {
    //     state: {
    //       displayMode: 'window',
    //       selectedMeeting: {
    //         id: response.id
    //       },
    //       videoMuted: true,
    //       audioMuted: true,
    //       isHost
    //     }
    //   })
    // }, (e) => {
    // }, '', false);
  }


  return (
    <div className="auth-wrapper auth-cover">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <div
            style={{ width: '72px', textAlign: 'right', marginLeft: '32px' }}
            className={'col-*-*'}
          >
            <img
              src={require('../../../../../../assets/armscor_logo.png')}
              alt="..."
            />
          </div>
        </Link>

        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">

            { errorMessage ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">{errorMessage}</Alert>
            ) : null }

            { usernameState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Display Name is required</Alert>
            ) : null }


            <CardTitle tag="h2" className="mb-1" style={{ color: '#00476a' }}>
              Welcome to Armscor.
            </CardTitle>

            <CardText style={{color: '#00476a'}}>
              Type your name and click Join meeting.
            </CardText>

            <form className="auth-login-form mt-2">
              {
                !isMeetingRedirect &&
                <div className="mb-1">
                  <CustomInput
                    labelText="Name"
                    id="username"
                    formControlProps={{ fullWidth: true }}
                    success={usernameState === 'success'}
                    error={usernameState === 'error'}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Face style={styles.inputAdornmentIcon} />
                        </InputAdornment>
                      ),
                      value: username,
                      onChange: (e) => {
                        setUsername(e.target.value);
                      },
                    }}
                  />
                </div>
              }
             <div className="w-100">
                <Button
                  disabled={isLoading}
                  onClick={() => redirectToMeeting()}
                  variant="contained"
                  color="primary"
                  fullWidth={true}
                  style={styles.loginBtn}
                >
                  {isLoading && (
                    <i
                      className="fa fa-refresh fa-spin"
                      style={{ marginRight: '8px' }}
                    />
                  )}
                  {isLoading && <span>LOADING...</span>}
                  {!isLoading && <span>Join meeting</span>}
                </Button>
              </div>
            </form>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default ExternalMeetingAttendee;
