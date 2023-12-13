import React, {useRef, useState} from 'react';

import {useLocation, useNavigate, useParams} from 'react-router-dom';
import CaseList from '../view/CaseList';
import ViewCase from '../view/ViewCase';
import AddCase from '../view/AddCase';
import appManager from "../../../common/service/AppManager";
import "./ViewContainer.css"

const ViewContainer = (props) => {
  const params = useParams();
  const location = useLocation();
  const attributes = useRef({
    currentWindow: null,
    currentView: null,
    data: null,
    currentDisplayMode: 'inline'
  });

  const [refresher, setRefresher] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    return () => {
      attributes.current.data = null;
    };
  }, []);

  const renderView = () => {
    let viewId = params.id;
    let element;
    let data = location.state;
    let displayMode = null;

    if (data) {
      displayMode = data.displayMode;
    }

    if (!displayMode) {
      displayMode = 'inline';
    }

    console.log("NAVIGATING TO : ", viewId);
    console.log("CLOSING : " + attributes.current.windowClosing + " : " + displayMode);
    if (displayMode !== attributes.current.currentDisplayMode) {
      attributes.current.currentDisplayMode = displayMode;
    }

    if (displayMode === 'inline' && viewId !== attributes.current.currentView) {
      attributes.current.currentView = viewId;
    }

    if (displayMode === 'window' && viewId !== attributes.current.currentWindow) {
      attributes.current.currentWindow = viewId;
    }

    if (data !== attributes.current.data) {
      attributes.current.data = data;
    }

    console.log("ATTRIBUTES : ", attributes.current);
    switch (attributes.current.currentView) {
      case 'caseList':
        element = <CaseList />;
        break;
      case 'viewCase':
        element = <ViewCase selected={location.state}/>;
        break;
      case 'addCase':
        element = <AddCase />;
        break;
    }

    return <>
      {
        element
      }
    </>
  };

  return renderView();
};

export default ViewContainer;
