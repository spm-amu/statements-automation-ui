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

const {electron} = window;

const ExternalMeetingAttendee = (props) => {
  const [meetingDisplayNameError] = useState(false);
  const [meetingDisplayName, setMeetingDisplayName] = useState('');
  const [meetingID, setMeetingID] = useState('');
  const [meetingAccessToken, setMeetingAccessToken] = useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExternalUser, setIsExternalUser] = React.useState(false);
  const [isMeetingRedirect, setIsMeetingRedirect] = React.useState(false);
  const [redirectData, setRedirectData] = React.useState(null);
  const [meetingDisplayNameState, setMeetingDisplayNameState] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const clearErrorStates = () => {
    setMeetingDisplayNameState('');
    setErrorMessage('');
  };

  useEffect(() => {

    clearErrorStates();

    // const params = new URLSearchParams(location.search);
    // const meetingId = params.get('meetingId');
    // console.log("meetingId", meetingId);
    // setMeetingID(meetingId);
    //
    // const meetingAccessToken = params.get('accessToken');
    // console.log("meetingAccessToken", meetingAccessToken);
    // setMeetingAccessToken(meetingAccessToken);

    let accessToken = appManager.get(ACCESS_TOKEN_PROPERTY);
    let refreshToken = appManager.get(REFRESH_TOKEN_PROPERTY);

    // if (meetingId !== null && meetingAccessToken !== null) {
    //   post(
    //     `${host}/api/v1/auth/validateMeetingToken`,
    //     (response) => {
    //
    //       console.log("response", response);
    //       if (response.meetingAttendee.external) {
    //         console.log("deal with external user ...");
    //         if (Utils.isNull(accessToken) || Utils.isNull(refreshToken)) {
    //           // response.meetingAttendee.emailAddress
    //           // meetingDisplayName
    //           navigate('/login', {
    //             state: {
    //               meetingId: meetingId,
    //               externalUser: true,
    //               tokenUserId: response.userId
    //             }
    //           });
    //         } else {
    //           let userDetails = appManager.getUserDetails();
    //           if (response.userId === userDetails.userId) {
    //             redirectToMeeting();
    //           }
    //         }
    //       } else {
    //         console.log("deal with internal user ...");
    //         if (Utils.isNull(accessToken) || Utils.isNull(refreshToken)) {
    //           navigate('/login', {
    //             state: {
    //               meetingId: meetingId,
    //               tokenUserId: response.userId
    //             }
    //           });
    //         } else {
    //           let userDetails = appManager.getUserDetails();
    //           if (response.userId === userDetails.userId) {
    //             redirectToMeeting();
    //           }
    //         }
    //       }
    //     },
    //     (e) => {
    //       console.log('ERR: ', e);
    //     },
    //     {
    //       token: meetingAccessToken
    //     },
    //     null,
    //     false,
    //     false
    //   );
    // }

    if (location.state) {
      setMeetingDisplayName(location.state.tokenUserId);
      setRedirectData(location.state);
      setIsMeetingRedirect(true);
    }
  }, []);

  const redirectToMeeting = () => {
    get(`${host}/api/v1/meeting/fetch/${meetingID}`, (response) => {
      let userDetails = appManager.getUserDetails();
      let isHost = false;
      response.extendedProps.attendees.forEach(att => {
        if (att.userId === userDetails.userId) {
          isHost = att.type === 'HOST';
        }
      });

      navigate("/view/meetingRoom", {
        state: {
          displayMode: 'window',
          selectedMeeting: {
            id: response.id
          },
          videoMuted: true,
          audioMuted: true,
          isHost
        }
      })
    }, (e) => {
    }, '', false);
  }

  const joinMeeting = () => {

    clearErrorStates();

    if (meetingDisplayName === '') {
      setMeetingDisplayNameState('error');
    }

    if (meetingDisplayName) {
      setIsLoading(true);

      post(
        `${host}/api/v1/auth/login`,
        (response) => {
          setIsLoading(false);

          // TODO : Set expiry date for desktop app in line with the user's AD password change. DO NOT SET expiry date for web all so that the cookie dies with the browser
          let lastLogin = new Date().getTime();
          appManager.add("accessToken", response.access_token);
          appManager.add("refreshToken", response.refresh_token);
          appManager.add("lastLogin", lastLogin);

          if (!isSafari && !isChrome) {
            electron.ipcRenderer.sendMessage('saveTokens', {
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              lastLogin: lastLogin
            });

            electron.ipcRenderer.on('tokensSaved', args => {
              electron.ipcRenderer.removeAllListeners("tokensSaved");
              electron.ipcRenderer.removeAllListeners("joinMeetingEvent");

              navigate('/dashboard', {
                state: redirectData
              });
            });
          } else {
            navigate('/dashboard', {
              state: {
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                lastLogin
              }
            });
          }
        },
        (e) => {
          console.log('#### ERROR: ' + JSON.stringify(e));
          setIsLoading(false);
          setErrorMessage('Invalid meeting display name');
        },
        {
          username: name,
          password: '',
        },
        null,
        true,
        false
      );
    }
  };

  if ({isExternalUser}) {
    return (
      <div className="auth-wrapper auth-cover">
        <Row className="auth-inner m-0">
          <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
            <div
              style={{width: '72px', textAlign: 'right', marginLeft: '32px'}}
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
              {errorMessage ? (
                <Alert style={{marginBottom: '16px'}} severity="error">{errorMessage}</Alert>
              ) : null}

              {meetingDisplayNameState === 'error' ? (
                <Alert style={{marginBottom: '16px'}} severity="error">Name is required</Alert>
              ) : null}

              <CardTitle tag="h2" className="mb-1" style={{color: '#00476a'}}>
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
                      id="name"
                      formControlProps={{fullWidth: true}}
                      success={meetingDisplayNameState === 'success'}
                      error={meetingDisplayNameState === 'error'}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Face style={styles.inputAdornmentIcon}/>
                          </InputAdornment>
                        ),
                        value: name,
                        onChange: (e) => {
                          setMeetingDisplayName(e.target.value);
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
                        style={{marginRight: '8px'}}
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
  }
};

export default ExternalMeetingAttendee;
