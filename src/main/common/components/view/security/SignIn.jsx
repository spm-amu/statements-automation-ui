import React, {useEffect, useState} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {CardText, CardTitle, Col, Row,} from 'reactstrap';
import '../../../assets/scss/page-authentication.scss';
import Button from '../../RegularButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { post } from '../../../service/RestService';
import styles from './LoginStyle';
import CustomInput from '../../customInput/CustomInput';
import {Face} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import appManager from "../../../service/AppManager";
import { isSafari, isChrome, isIE, isEdge } from 'react-device-detect';

const {electron} = window;

const SignIn = (props) => {
  const [username, setUsername] = useState('');
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
    setPasswordState('');
    setErrorMessage('');
  };

  useEffect(() => {
    clearErrorStates();

    if (!isSafari && !isChrome && !isIE && !isEdge) {
      electron.ipcRenderer.on('joinMeetingEvent', args => {
        if (args.payload.params.redirect) {
          post(
            `${appManager.getAPIHost()}/api/v1/auth/validateMeetingToken`,
            (response) => {
              if (response.userId) {
                setUsername(response.userId);
                setIsMeetingRedirect(true);
              }

              setRedirectData({
                meetingId: response.meetingID,
                tokenUserId: response.userId
              });
            },
            (e) => {
              console.log('ERR: ', e);
            },
            {
              token: args.payload.params.accessToken
            },
            null,
            false,
            false
          );
        }
      });
    }

    console.log('@@@@@@@@', location);

    if (location.state) {
      setUsername(location.state.tokenUserId);
      setRedirectData(location.state);
      setIsMeetingRedirect(true);
    }
  }, []);

  const fireLogin = () => {
    clearErrorStates();

    if (!username) {
      setUsernameState('error');
    }

    if (!password) {
      setPasswordState('error');
    }

    if (username && password) {
      setIsLoading(true);

      let loginUrl = location.state && location.state.meetingExternal ? `meetingLogin/${location.state.meetingId}` : 'login';

      post(
        `${appManager.getAPIHost()}/api/v1/auth/${loginUrl}`,
        (response) => {
          setIsLoading(false);

          if(!response.access_token) {
            setErrorMessage('Invalid username or password');
            return;
          }

          // TODO : Set expiry date for desktop app in line with the user's AD password change. DO NOT SET expiry date for web all so that the cookie dies with the browser

          let lastLogin = new Date().getTime();
          appManager.add("accessToken", response.access_token);
          appManager.add("refreshToken", response.refresh_token);
          appManager.add("lastLogin", lastLogin);

          if (!isSafari && !isChrome && !isIE && !isEdge) {
            electron.ipcRenderer.sendMessage('saveTokens', {
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              lastLogin: lastLogin
            });

            electron.ipcRenderer.on('tokensSaved', args => {
              electron.ipcRenderer.removeAllListeners("tokensSaved");
              electron.ipcRenderer.removeAllListeners("joinMeetingEvent");

              if (location.state) {
                electron.ipcRenderer.sendMessage('joinMeetingEvent', {
                  payload: {
                    params: {
                      meetingId: location.state.meetingId,
                      accessToken: location.state.token,
                      redirect: true
                    }
                  }
                })
              }

              navigate('/dashboard', {
                state: redirectData
              });
            });
          } else {

            const data = {
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              lastLogin
            };

            if (redirectData) {
              data.meetingId = redirectData.meetingId;
            }

            navigate('/dashboard', {
              state: data
            });
          }
        },
        (e) => {
          console.log('#### ERROR: ' + JSON.stringify(e));
          setIsLoading(false);
          setErrorMessage('A system error has occurred. Please contact your system administrator or try again later');
        },
        {
          username: username,
          password: password,
        },
        null,
        true,
        false
      );
    }
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

            { usernameState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Username is required</Alert>
            ) : null }

            { passwordState === 'error' ? (
              <Alert style={{ marginBottom: '16px' }} severity="error">Password is required</Alert>
            ) : null }

            <CardTitle tag="h2" className="mb-1" style={{ color: '#00476a' }}>
              Welcome to Armscor Connect
            </CardTitle>
            <CardText style={{ color: '#00476a' }}>
              {
                location.state && location.state.meetingExternal ? 'Please enter the passcode sent to your email.' : 'Please sign-in to your account and start connecting...'
              }
            </CardText>

            <form className="auth-login-form mt-2">
              {
                !isMeetingRedirect &&
                  <div className="mb-1">
                    <CustomInput
                      labelText="Username"
                      id="username"
                      formControlProps={{ fullWidth: true }}
                      success={usernameState === 'success'}
                      error={usernameState === 'error'}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          fireLogin();
                        }
                      }}
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
              <div className="mb-1">
                <CustomInput
                  labelText={ location.state && location.state.meetingExternal ? 'Passcode' : 'Password'}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  success={passwordState === 'success'}
                  error={passwordState === 'error'}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fireLogin();
                    }
                  }}
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color={'inherit'}
                          aria-label="toggle password visibility"
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
                    value: password,
                    onChange: (e) => {
                      setPassword(e.target.value);
                    },
                  }}
                />
              </div>
              <div className="w-100">
                <Button
                  disabled={isLoading}
                  onClick={() => fireLogin()}
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
                  {!isLoading && <span>LOGIN</span>}
                </Button>
              </div>
            </form>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default SignIn;
