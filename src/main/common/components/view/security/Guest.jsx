import React, {useEffect, useState} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {CardText, CardTitle, Col, Row,} from 'reactstrap';
import '../../../assets/scss/page-authentication.scss';
import Button from '../../RegularButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { get, host, post } from '../../../service/RestService';
import styles from './LoginStyle';
import CustomInput from '../../customInput/CustomInput';
import { Email, Face } from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import appManager from "../../../../common/service/AppManager";
import Utils from "../../../Utils";
import {ACCESS_TOKEN_PROPERTY, REFRESH_TOKEN_PROPERTY} from "../../../service/TokenManager";
import { SystemEventType } from '../../../types';
import { isSafari, isChrome, isIE, isEdge } from 'react-device-detect';

const {electron} = window;

const Guest = (props) => {
  const [usernameError, setUsernameError] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [privateExternal, setPrivateExternal] = React.useState(false);
  const [emailState, setEmailState] = React.useState('');
  const [nameState, setNameState] = React.useState('');
  const [passcodeState, setPasscodeState] = React.useState('');
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
    setNameState('');
    setEmailState('');
    setPasscodeState('');
    setErrorMessage('');
  };

  useEffect(() => {
    if (location.state && location.state.tokenUserId) {
      setEmail(location.state.tokenUserId);
      setPrivateExternal(true);
    }
  }, [])

  const fireJoinMeeting = () => {
    clearErrorStates();

    if (name === '') {
      setNameState('error');
    }

    if (name && passcode && email) {
      setIsLoading(true);
    }

    post(
      `${host}/api/v1/auth/meetingLogin/${location.state.meetingId}`,
      (response) => {
        setIsLoading(false);

        console.log('____ RES: ', response);

        let lastLogin = new Date().getTime();
        appManager.add("accessToken", response.access_token);
        appManager.add("refreshToken", response.refresh_token);
        appManager.add("lastLogin", lastLogin);

        const data = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          lastLogin,
          meetingId: location.state.meetingId,
          guest: {
            name: name,
            email: email
          }
        };

        navigate('/dashboard', {
          state: data
        });
      },
      (e) => {
        setIsLoading(false);
        setErrorMessage('Invalid passcode');
      },
      {
        username: email,
        password: passcode,
      },
      null,
      true,
      false
    );
  };

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
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            <img className="img-fluid" src={require('../../../../../../assets/lock2.svg')} alt="Login Cover" />
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">

            { errorMessage ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">{errorMessage}</Alert>
            ) : null }

            { nameState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Name is required</Alert>
            ) : null }

            { emailState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Email is required</Alert>
            ) : null }

            { passcodeState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Password is required</Alert>
            ) : null }

            <CardTitle tag="h2" className="mb-1" style={{ color: '#00476a' }}>
              Welcome to Armscor.
            </CardTitle>
            <CardText style={{ color: '#00476a' }}>
              Please enter your details to join the meeting.
            </CardText>

            <form className="auth-login-form mt-2">
              {
                !privateExternal &&
                <div className="mb-1">
                  <CustomInput
                    labelText="Email"
                    id="email"
                    formControlProps={{ fullWidth: true }}
                    success={emailState === 'success'}
                    error={emailState === 'error'}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Email style={styles.inputAdornmentIcon} />
                        </InputAdornment>
                      ),
                      value: email,
                      onChange: (e) => {
                        setEmail(e.target.value);
                      },
                    }}
                  />
                </div>
              }

              <div className="mb-1">
                <CustomInput
                  labelText="Name"
                  id="name"
                  formControlProps={{ fullWidth: true }}
                  success={nameState === 'success'}
                  error={nameState === 'error'}
                  inputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Face style={styles.inputAdornmentIcon} />
                      </InputAdornment>
                    ),
                    value: name,
                    onChange: (e) => {
                      setName(e.target.value);
                    },
                  }}
                />
              </div>
              <div className="mb-1">
                <CustomInput
                  labelText={ 'Passcode'}
                  id="passcode"
                  type={showPassword ? 'text' : 'password'}
                  success={passcodeState === 'success'}
                  error={passcodeState === 'error'}
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color={'inherit'}
                          aria-label="toggle passcode visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility style={styles.inputAdornmentIcon} /> : <VisibilityOff style={styles.inputAdornmentIcon} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    type: showPassword ? 'text' : 'password',
                    autoComplete: 'off',
                    required: true,
                    value: passcode,
                    onChange: (e) => {
                      setPasscode(e.target.value);
                    },
                  }}
                />
              </div>
              <div className="w-100">
                <Button
                  disabled={isLoading}
                  onClick={() => fireJoinMeeting()}
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
                  {!isLoading && <span>JOIN MEETING</span>}
                </Button>
              </div>
            </form>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default Guest;
