import React from 'react';

import {useParams} from 'react-router-dom';
import Calendar from "../view/Calendar";
import Charts from "../view/Charts";
import Files from "../view/Files";
import MeetingHistory from "../view/MeetingHistory";

const ViewContainer = (props) => {

  const params = useParams();

  const renderView = () => {
    let viewId = params.id;

    switch (viewId) {
      case 'calender':
        return <Calendar/>;
      case 'charts':
        return <Charts/>;
      case 'meetingHistory':
        return <MeetingHistory/>;
      case 'files':
        return <Files/>;
    }

    return null;
  };

  return renderView()
};

export default ViewContainer;
