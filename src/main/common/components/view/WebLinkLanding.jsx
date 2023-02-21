import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {CardBody, CardText, CardTitle, Col, Row} from 'reactstrap';
import Button from '@material-ui/core/Button';
import './WebLinkLanding.css'
import {get, post} from '../../service/RestService';
import Utils from '../../Utils';
import appManager from '../../service/AppManager';
import {SystemEventType} from '../../types';
import {ACCESS_TOKEN_PROPERTY, REFRESH_TOKEN_PROPERTY} from '../../service/TokenManager';
import {Alert} from "@material-ui/lab";

const WebLinkLanding = (props) => {
  const navigate = useNavigate();

  const [meetingId, setMeetingId] = useState('');
  const [urlToken, setUrlToken] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const [queryParameters] = useSearchParams();

  useEffect(() => {
    if (urlToken && meetingId) {
      window.location.replace(`armscor-connect://meetingId=${meetingId}&accessToken=${urlToken}`);
    }
  }, [urlToken, meetingId]);

  useEffect(() => {
    const _meetingId = queryParameters.get("meetingId");
    const _urlToken = queryParameters.get("accessToken");

    setMeetingId(_meetingId);
    setUrlToken(_urlToken);
  }, []);

  const openApp = () => {
    window.location.href = `armscor-connect://meetingId=${meetingId}&accessToken=${urlToken}`;
  }

  const redirectToMeeting = (params) => {
    get(`${appManager.getAPIHost()}/api/v1/meeting/fetch/${params.meetingId}`, (response) => {
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
  };

  const continueOnBrowser = () => {
    let accessToken = appManager.get(ACCESS_TOKEN_PROPERTY);
    let refreshToken = appManager.get(REFRESH_TOKEN_PROPERTY);

    post(
      `${appManager.getAPIHost()}/api/v1/auth/validateMeetingToken`,
      (response) => {
        console.log('_______ RES: ', response);

        if (response.valid) {
          setErrorMessage(null);
          if ((Utils.isNull(accessToken) || Utils.isNull(refreshToken))) {
            if (response.meetingAttendee.external) {
              let _user = response.meetingAttendee.external ? response.meetingAttendee.emailAddress : response.userId;
              navigate('/guest', {
                state: {
                  meetingId: meetingId,
                  tokenUserId: _user,
                  token: urlToken,
                  meetingExternal: response.meetingAttendee.external
                }
              });
            } else {
              navigate('/login', {
                state: {
                  meetingId: meetingId,
                  tokenUserId: response.userId,
                  token: urlToken
                }
              });
            }
          } else {
            let userDetails = appManager.getUserDetails();
            if (response.userId === userDetails.userId) {
              redirectToMeeting({
                meetingId: meetingId
              });
            } else {
              appManager.fireEvent(SystemEventType.API_ERROR, {
                message: `Please login in as ${response.userId} to join this meeting. Please avoid sharing private meetings with uninvited guests!`
              });
            }
          }
        } else {
          setErrorMessage(response.message);
        }
      },
      (e) => {
        appManager.fireEvent(SystemEventType.API_ERROR, {
          message: 'Invalid meeting link.'
        });
      },
      {
        token: urlToken
      },
      '',
      true,
      false
    );
  }

  return (
    <div className="auth-wrapper auth-cover">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <div
            style={{width: '72px', textAlign: 'right', marginLeft: '32px'}}
            className={'col-*-*'}
          >
            <img
              src={require('../../../../../assets/armscor_logo.png')}
              alt="..."
            />
          </div>
        </Link>
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            <img className="img-fluid" src={require('../../assets/meet.svg')} alt="Login Cover"/>
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            {errorMessage && (
              <Alert style={{marginBottom: '16px'}} severity="error">{errorMessage}</Alert>
            )}

            <CardTitle tag="h2" className="mb-1" style={{color: '#00476a', marginBottom: '16px'}}>
              How do you want to join your Armscor meeting?
            </CardTitle>

            <div className="card-wrapper card mb-3 mt-3">
              <CardBody className={'card-body-wrapper'}>
                <CardTitle tag="h4" className="mb-1" style={{color: '#00476a'}}>
                  Continue on this browser
                </CardTitle>
                <CardText style={{color: '#00476a'}}>
                  No download or installation required.
                </CardText>
                <Button
                  onClick={() => continueOnBrowser()}
                  style={{marginTop: '0.75rem'}}
                  color={'primary'}
                  variant={'outlined'}
                >
                  Continue
                </Button>
              </CardBody>
            </div>

            <div className="card-wrapper card mb-3 mt-3">
              <CardBody className={'card-body-wrapper'}>
                <CardTitle tag="h4" className="mb-1" style={{color: '#00476a'}}>
                  Open your Armscor App
                </CardTitle>
                <CardText style={{color: '#00476a'}}>
                  Already have it? Go right to your meeting.
                </CardText>
                <Button
                  onClick={() => openApp()}
                  style={{marginTop: '0.75rem'}}
                  color={'primary'}
                  variant={'outlined'}
                >
                  Open App
                </Button>
              </CardBody>
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default WebLinkLanding;
