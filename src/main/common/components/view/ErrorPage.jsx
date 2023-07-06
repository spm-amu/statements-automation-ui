// ** React Imports
import React from 'react';

// ** MUI Components
import { Box, Typography } from '@material-ui/core';

import './ErrorPage.css';
import styles from './security/LoginStyle';

import Button from '../RegularButton';
const {electron} = window;
import { useErrorBoundary } from "react-error-boundary";

const ErrorPage = () => {
  const { resetBoundary } = useErrorBoundary();

  const fireHomeRedirect = () => {
    resetBoundary();
    electron.ipcRenderer.sendMessage('homeRedirect', {});
  }

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '90vw' }}>
          <Typography variant='h4' sx={{ mb: 1.5 }}>
            Oops, something went wrong!
          </Typography>
          <Typography sx={{ mb: 6, color: '#B2B4B8' }}>
            There was an error with the internal server. Please contact your site administrator.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginTop: '8px', marginBottom: '8px' }}>
            <div className="w-25" >
              <Button
                onClick={() => fireHomeRedirect()}
                variant="contained"
                color="primary"
                fullWidth={true}
                style={styles.loginBtn}
              >
                HOME
              </Button>
            </div>
          </div>
        </div>
        <img style={{ marginTop: '64px' }} height='100' alt='error-illustration' src={require('../../assets/img/armscor_logo.png')} />
      </Box>
    </Box>
  )
}

export default ErrorPage
