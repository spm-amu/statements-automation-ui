import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/armscor_logo.png';
import './App.css';
import BasicBusinessAppDashboard from "../main/desktop/dashboard/BasicBusinessAppDashboard";

const Hello = () => {
  return (
    <div style={{width: '100%'}}>
      <div className="Hello">
        {/*<img width="200px" alt="icon" src={icon} />*/}
        <BasicBusinessAppDashboard logoutCallBack={() => {
          alert('Logout Firee')
        }}
                                   avatar={''}
                                   logo={icon}
                                   appLogoPath={''}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router style={{border: '8px solid yello'}}>
      <Routes>
        <Route path="*" element={<Hello />} />
      </Routes>
    </Router>
  );
}

