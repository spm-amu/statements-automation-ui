﻿import React from 'react';
import {Routes, Route, withRouter, useNavigate} from 'react-router-dom';
import './viewport.css';
import ViewContainer from "./ViewContainer";

const ViewPort = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if(loading) {
      setLoading(false);
    }
  });

  React.useEffect(() => {
    if(!loading) {
      navigate('/view/calendar')
    }
  }, [loading]);

  return (
    <div className={'viewport'}>
      <Routes>
        <Route path='/view/:id' element={<ViewContainer/>}/>
      </Routes>
    </div>
  )
};


//export default withRouter(ViewPort)
export default ViewPort
