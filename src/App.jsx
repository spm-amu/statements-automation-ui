import React from 'react';
import './App.css';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import ThemeDefault from './theme-default';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {createTheme} from "@material-ui/core";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import DashboardComponent from './common/components/layout/Dashboard';

const absaTheme = createTheme({
    palette: {
      primary: {
        main: 'rgb(175, 20, 75)'
      },
      secondary: {
        main: 'rgb(175, 20, 75)'
      },
      white: {
        main: '#ffffff'
      }
    }
  },
);

const Dashboard = () => {
  return (
    <div style={{width: '100%', height: '100vh', backgroundColor: '#FFFFFF'}}>
      <DashboardComponent />
    </div>
  );
};

export default function App() {

  return (
    <MuiThemeProvider muiTheme={ThemeDefault}>
      <ThemeProvider theme={absaTheme}>
          <Router>
            <Routes>
              <Route path="*" element={<Dashboard />}/>
            </Routes>
          </Router>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export const navigate = (path) => {
  navigate(path);
};
