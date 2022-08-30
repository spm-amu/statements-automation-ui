import React from 'react';
import {Routes, Route, withRouter} from 'react-router-dom';
import './viewport.css';
import '../view/Calendar'
import '../view/Charts'
import '../view/Files'
import '../view/MeetingHistory'
import ViewContainer from "./ViewContainer";

class ViewPort extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={'viewport'}>
              <Routes>
                <Route path='/view/:id' element={<ViewContainer />}/>
              </Routes>
            </div>
        )
    }
}


//export default withRouter(ViewPort)
export default ViewPort

