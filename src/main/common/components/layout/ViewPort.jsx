import React from 'react';
import {Route, withRouter} from 'react-router-dom';
import './viewport.css'

class ViewPort extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={'viewport'}>
              VIEWPORT
            </div>
        )
    }
}


//export default withRouter(ViewPort)
export default ViewPort

