import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';
import Button from '@material-ui/core/Button';
import './WebLinkLanding.css'

const WebLinkLanding = (props) => {
  let { meetingId, accessToken } = useParams();

  useEffect(() => {
    window.location.replace(`armscor-connect://meetingId=${meetingId}&accessToken=${accessToken}`);
  }, []);

  return (
    <div className="auth-wrapper auth-cover">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <div
            style={{ width: '72px', textAlign: 'right', marginLeft: '32px' }}
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
            <img className="img-fluid" src={require('../../assets/meet.svg')} alt="Login Cover" />
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="mb-1" style={{ color: '#00476a' , marginBottom: '16px' }}>
              How do you want to join your Armscor meeting?
            </CardTitle>

            <div className="card-wrapper card mb-3 mt-3">
              <CardBody className={'card-body-wrapper'}>
                <CardTitle tag="h4" className="mb-1" style={{ color: '#00476a' }}>
                  Continue on this browser
                </CardTitle>
                <CardText style={{ color: '#00476a' }}>
                  No download or installation required.
                </CardText>
                <Button
                  style={{ marginTop: '0.75rem' }}
                  color={'primary'}
                  variant={'outlined'}
                >
                  Continue
                </Button>
              </CardBody>
            </div>

            <div className="card-wrapper card mb-3 mt-3">
              <CardBody className={'card-body-wrapper'}>
                <CardTitle tag="h4" className="mb-1" style={{ color: '#00476a' }}>
                  Open your Armscor App
                </CardTitle>
                <CardText style={{ color: '#00476a' }}>
                  Already have it? Go right to your meeting.
                </CardText>
                <Button
                  style={{ marginTop: '0.75rem' }}
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
