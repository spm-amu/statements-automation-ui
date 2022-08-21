import React from 'react';
import {Route, withRouter} from 'react-router-dom';
import Utils from "../../../common/Utils";

class ViewPort extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div style={{height: Utils.isNull(this.props.height) ? 'calc(100vh - 90px)' : this.props.height}}>
              VIEWPORT
            </div>
        )
    }
}


//export default withRouter(ViewPort)
export default ViewPort

