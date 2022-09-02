import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import './viewport.css';
import Calender from '../../../desktop/dashboard/views/calender/Calender';

class ViewPort extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return <Calender />;
  }
}

// export default withRouter(ViewPort)
export default ViewPort;
