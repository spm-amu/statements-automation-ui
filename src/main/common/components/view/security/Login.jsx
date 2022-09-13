import React from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Help from '@material-ui/icons/Help';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import {withRouter} from 'react-router-dom';
import Alert from "react-bootstrap/Alert";
import styles from "./LoginStyle";
import Utils from '../../../Utils';
import {host, post} from "../../../service/RestService";
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [usernameError, setUsernameError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [username, setUsername] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div style={{
      backgroundColor: 'transparent',
      color: props.textColor,
      width: '100%'
    }}>
      <div style={{
        height: '100%',
        width: '100%',
        margin: 'auto'
      }}>
        <div style={{maxWidth: '500px', margin: 'auto'}}>
          <div className={"row"} style={styles.title}>
            <div style={{width: '72px', textAlign: 'right', marginLeft: '32px'}} className={'col-*-*'}>
              <img src={require('../../../../../../assets/armscor_logo.png')} alt="..."/>
            </div>
            <div style={{width: '70%', textAlign: 'left', paddingLeft: '16px', display: 'flex', alignItems: 'center'}}
                 className={'col-*-*'}>
              {'ARMSCOR Connect'}
            </div>
          </div>
          {!Utils.isNull(errorMessage) ? (
            <Alert
              variant="danger"
              show={!Utils.isNull(errorMessage)}
              onClose={() => setErrorMessage(null)}
              dismissible
            >
              <Alert.Heading>Login error!</Alert.Heading>
              <p>{errorMessage}</p>
            </Alert>
          ) : (
            ""
          )}
          <div style={styles.loginContainer}>
            <Paper style={styles.paper}>
              <form>
                <TextField
                  id="username"
                  required={true}
                  error={usernameError}
                  label="Username"
                  value={username || ''}
                  onChange={(e) => {
                    let usernamePresent = !Utils.isNull(e.target.value) && e.target.value.trim().length > 0;
                    setUsername(e.target.value);
                    setUsernameError(!usernamePresent);
                  }}
                  margin="normal"
                  variant="outlined"
                  style={{minWidth: "200px", width: "100%"}}>
                </TextField>
                <TextField
                  id="password"
                  required={true}
                  label="Password"
                  error={passwordError}
                  type={showPassword ? 'text' : 'password'}
                  value={password || ''}
                  onChange={(e) => {
                    let passwordPresent = !Utils.isNull(e.target.value) && e.target.value.trim().length > 0;
                    setPassword(e.target.value);
                    setPasswordError(!passwordPresent);
                  }}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility/> : <VisibilityOff/>}
                      </IconButton>
                    </InputAdornment>
                  }}
                  variant="outlined"
                  style={{minWidth: "200px", width: "100%"}}>
                </TextField>
                <div className="w-100">
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      post(`http://localhost:8070/vc/api/v1/auth/login`, (response) => {
                        sessionStorage.setItem("accessToken", response.session_token);
                        sessionStorage.setItem("idToken", response.response_token);
                        sessionStorage.setItem("username", username);

                        navigate('/dashboard');
                      }, (e) => {

                      }, {
                        username: username,
                        password: password
                      })
                    }}
                    variant="contained" color="primary"
                    fullWidth={true}
                    style={styles.loginBtn}>
                    {isLoading && (
                      <i
                        className="fa fa-refresh fa-spin"
                        style={{marginRight: "8px"}}
                      />
                    )}
                    {isLoading && <span>LOADING...</span>}
                    {!isLoading && <span>LOGIN</span>}
                  </Button>
                </div>
              </form>
            </Paper>
          </div>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
        Copyrights &copy; {1900 + new Date().getYear()} {" "}
      </div>
    </div>
  );
};

export default Login
