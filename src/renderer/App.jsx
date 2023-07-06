import React from 'react';
import icon from '../../assets/armscor_logo.png';
import './App.css';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import BasicBusinessAppDashboard from '../main/desktop/dashboard/BasicBusinessAppDashboard';
import ThemeDefault from './theme-default';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {createTheme} from "@material-ui/core";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
// ** Fake Database
import '../main/@fake-db';
import SignIn from '../main/common/components/view/security/SignIn';
import InComingCallWindow from '../main/common/components/meetingroom/InComingCallWindow';
import MessagePreview from '../main/common/components/meetingroom/MessagePreview';
import ExternalMeetingAttendee from "../main/common/components/view/security/ExternalMeetingAttendee";
import WebLinkLanding from '../main/common/components/view/WebLinkLanding';
import Guest from '../main/common/components/view/security/Guest';
import SystemAlertWindow from "../main/common/components/meetingroom/SystemAlertWindow";
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '../main/common/components/view/ErrorPage';

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

const Fallback = ({ error, resetErrorBoundary }) => {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  console.log('Error: ' + error.message);

  return (
    <div style={{width: '100%', height: '100vh', backgroundColor: '#E5E5E5'}}>
      <ErrorPage />
    </div>
  );
}

const Login = () => {
  return (
    <div style={{width: '100%', height: '100vh', backgroundColor: '#E5E5E5'}}>
      <SignIn />
    </div>
  );
};

const InComingCall = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <InComingCallWindow />
    </div>
  );
};

const SystemAlert = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <SystemAlertWindow />
    </div>
  );
};

const Message = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <MessagePreview />
    </div>
  );
};

const WebLink = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <WebLinkLanding />
    </div>
  );
};

const GuestLink = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <Guest />
    </div>
  );
};

const ExternalAttendee = () => {
  return (
    <div style={{width: '99vw', height: '100vh', backgroundColor: '#E5E5E5', overflow: 'hidden'}}>
      <ExternalMeetingAttendee />
    </div>
  );
};

const Dashboard = () => {
  return (
    <div style={{width: '100%', height: '100%'}}>
      <div className="landing" style={{width: '100%', height: '100%'}}>
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
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={(details) => {
            console.log('###### ERROR DETAILS: ', details);
            // Reset the state of your app so the error doesn't happen again
          }}
        >
          <Router>
            <Routes>
              <Route path="*" element={<Dashboard />}/>
              <Route path="/dashboard/*" element={<Dashboard />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/incomingCall" element={<InComingCall />}/>
              <Route path="/systemAlert" element={<SystemAlert />}/>
              <Route path="/messagePreview" element={<Message />}/>
              <Route path="/webLink" element={<WebLink />}/>
              <Route path="/guest" element={<GuestLink />}/>
              <Route path="/externalAttendeeView" element={<ExternalAttendee />}/>
            </Routes>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export const navigate = (path) => {
  navigate(path);
};
