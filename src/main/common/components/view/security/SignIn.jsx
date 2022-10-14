import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Form,
  Input,
  Label,
  CardText,
  CardTitle,
  UncontrolledTooltip,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import InputPasswordToggle from '../../InputPasswordToggle';
import '../../../assets/scss/page-authentication.scss';
import Utils from '../../../Utils';
import TextField from '@material-ui/core/TextField';
import Button from '../../RegularButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { host, post } from '../../../service/RestService';
import styles from './LoginStyle';

import { useNavigate } from 'react-router-dom';
import CardHeader from '../../card/CardHeader';
import Danger from '../../typography/Danger';
import CustomInput from '../../customInput/CustomInput';
import { Face } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const SignIn = (props) => {
  const [usernameError, setUsernameError] = useState(false);
  const [username, setUsername] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [usernameState, setUsernameState] = React.useState('');
  const [passwordState, setPasswordState] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);

  const navigate = useNavigate();

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
  }

  useEffect(() => {
    clearErrorStates()
  }, []);

  const fireLogin = () => {
    clearErrorStates();

    if (username === '') {
      setUsernameState('error');
    }

    if (password === '') {
      setPasswordState('error');
    }

    if (username && password) {
      setIsLoading(true);

      post(
        `${host}/api/v1/auth/login`,
        (response) => {
          setIsLoading(false);

          sessionStorage.setItem('accessToken', response.access_token);
          sessionStorage.setItem('idToken', response.response_token);
          sessionStorage.setItem('username', username);

          navigate('/dashboard');
        },
        (e) => {
          console.log('#### ERROR: ' + JSON.stringify(e))
          setIsLoading(false);
          setErrorMessage('Invalid username or password');
        },
        {
          username: username,
          password: password,
        },
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
              Welcome to Armscor.
            </CardTitle>
            <CardText style={{ color: '#00476a' }}>
              Please sign-in to your account and start connecting...
            </CardText>

            <form className="auth-login-form mt-2">
              <div className="mb-1">
                <CustomInput
                  labelText="Username"
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
              <div className="mb-1">
                <CustomInput
                  labelText="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  success={passwordState === 'success'}
                  error={passwordState === 'error'}
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
                          {showPassword ? <Visibility /> : <VisibilityOff />}
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
