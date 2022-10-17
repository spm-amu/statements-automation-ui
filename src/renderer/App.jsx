import React from 'react';
import icon from '../../assets/armscor_logo.png';
import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import LoginView from '../main/common/components/view/security/Login';
import BasicBusinessAppDashboard from '../main/desktop/dashboard/BasicBusinessAppDashboard';
import ThemeDefault from './theme-default';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {createTheme} from "@material-ui/core";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

// ** Fake Database
import '../main/@fake-db';
import SignIn from '../main/common/components/view/security/SignIn';
import LottieIcon from '../main/common/components/LottieIcon';
import IconButton from '@material-ui/core/IconButton';
import Icon from '../main/common/components/Icon';
import DialingPreview from '../main/common/components/vc/DialingPreview';

const armscorTheme = createTheme({
    palette: {
      primary: {
        main: '#985F31'
      },
      secondary: {
        main: '#01476C'
      },
      white: {
        main: '#ffffff'
      }
    }
  },
);

const Login = () => {
  return (
    <div style={{width: '100%', height: '100vh', backgroundColor: '#E5E5E5'}}>
      <SignIn />
    </div>
  );
};

const Dialing = () => {
  return (
    <div style={{width: '100%', height: '100vh', backgroundColor: '#E5E5E5'}}>
      <DialingPreview />
    </div>
  );
};

const Dashboard = () => {
  return (
    <div style={{width: '100%'}}>
      <div className="Landing">
        <BasicBusinessAppDashboard
          avatar=""
          logo={icon}
          appLogoPath=""
        />
      </div>
    </div>
  );
};

export default function App() {

  return (
    <MuiThemeProvider muiTheme={ThemeDefault}>
      <ThemeProvider theme={armscorTheme}>
        <Router>
          <Routes>
            <Route path="*" element={<Dashboard/>}/>
            <Route path="/dashboard/*" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/dialingPreview" element={<Dialing />}/>
          </Routes>
        </Router>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}
