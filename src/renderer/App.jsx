import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../main/common/redux/store/store';
import icon from '../../assets/armscor_logo.png';
import './App.css';
import LoginView from '../main/common/components/view/security/Login';
import BasicBusinessAppDashboard from '../main/desktop/dashboard/BasicBusinessAppDashboard';

// ** Fake Database
import '../main/@fake-db';

const Login = () => {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#E5E5E5' }}>
      <div className="Landing" style={{height: '100%', display: 'flex', alignItems: 'center'}}>
        <LoginView />
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div style={{ width: '100%' }}>
      <div className="Landing">
        <BasicBusinessAppDashboard
          logoutCallBack={() => {
            alert('Logout Firee');
          }}
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
    <Provider store={store}>
      <Router style={{ border: '8px solid yello' }}>
        <Routes>
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </Provider>
  );
}
