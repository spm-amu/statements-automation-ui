import React from "react";
import classNames from "classnames";

import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  NavbarBrand,
  Navbar,
  NavLink,
  Nav,
  Container,
  Modal
} from "reactstrap";
import {withRouter} from "react-router-dom";
import Utils from "../../Utils";
import IconButton from '@material-ui/core/IconButton';
import {grey800} from "material-ui/styles/colors";
import './navbar.css'

const propHandler = (state) => {
  let activeRouteMenu = state.dashboard.activeRouteMenu;

  return {
    activeRouteMenu: activeRouteMenu
  };
};

class HomeNavbar extends React.Component {

  styles = {
    header: {
      backgroundColor: this.props.color,
      height: '136px'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: false,
      color: "navbar-transparent",
      modalSearch: false,
      avatar: Utils.isNull(this.props.avatar) ? require("./default-avatar.png") :
        this.props.avatar
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateColor);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateColor);
  }

  componentDidUpdate(prevProps) {
    /*if (prevProps.avatar !== this.props.avatar) {
      this.setState({avatar: this.props.avatar});
    }*/
  }

  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  updateColor = () => {
    if (window.innerWidth < 993 && this.state.collapseOpen) {
      this.setState({
        color: "bg-white",
      });
    } else {
      this.setState({
        color: "navbar-transparent",
      });
    }
  };
  // this function opens and closes the collapse on small devices
  toggleCollapse = () => {
    if (this.state.collapseOpen) {
      this.setState({
        color: "navbar-transparent",
      });
    } else {
      this.setState({
        color: "bg-white",
      });
    }
    this.setState({
      collapseOpen: !this.state.collapseOpen,
    });
  };
  // this function is to open the Search modal
  toggleModalSearch = () => {
    this.setState({
      modalSearch: !this.state.modalSearch,
    });
  };

  launchView(path) {
  };

  formatDateNumber = (val) => {
    if(parseFloat(val) < 10) {
      return '0' + val;
    }

    return val;
  };

  getTodayDate = () => {
    let today = new Date("01/01/2022");
    return `${today.toLocaleDateString('en-us', {weekday: 'short'})}, 
            ${this.formatDateNumber(today.toLocaleDateString('en-us', {day: 'numeric'}))} 
            ${this.formatDateNumber(today.toLocaleDateString('en-us', {month: 'long'}))} 
            ${this.formatDateNumber(today.toLocaleDateString('en-us', {year: 'numeric'}))}`;
  };

  render() {
    return (
      <>
        <Navbar
          style={this.styles.header}
          className={classNames("navbar-absolute")}
          expand="lg"
        >
          <div className={'row navstrip no-margin .no-padding'}>
            <div className={'col no-margin .no-padding'}
                 style={{float: 'left'}}>
              <div className={'row'}>
                <div className={'col-*-*'} style={{display: 'flex', alignItems: 'center'}}>
                  <div
                    className={classNames("navbar-toggle d-inline", {
                      toggled: this.props.sidebarOpened,
                    })}
                  >
                    <button
                      className="navbar-toggler"
                      type="button"
                      onClick={this.props.toggleSidebar}
                    >
                                    <span className="navbar-toggler-bar bar1"
                                          style={{background: this.props.themeTextColor}}/>
                      <span className="navbar-toggler-bar bar2"
                            style={{background: this.props.themeTextColor}}/>
                      <span className="navbar-toggler-bar bar3"
                            style={{background: this.props.themeTextColor}}/>
                    </button>
                    {" "}
                  </div>

                </div>
                <div className={'col no-margin .no-padding'}
                     style={{float: 'left'}}>
                  <div className={'user-label'}>Welcome, A Shandlale</div>
                  <div className={'date-label'}>{this.getTodayDate()}</div>
                </div>
              </div>
              {" "}
            </div>
            <div className={'col no-margin .no-padding nav-right-buttons'}>
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navigation"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={this.toggleCollapse}
              >
                            <span className="navbar-toggler-bar navbar-kebab"
                                  style={{background: this.props.themeTextColor}}/>
                <span className="navbar-toggler-bar navbar-kebab"
                      style={{background: this.props.themeTextColor}}/>
                <span className="navbar-toggler-bar navbar-kebab"
                      style={{background: this.props.themeTextColor}}/>
              </button>
              <Collapse navbar isOpen={this.state.collapseOpen}>
                <Nav className="ml-auto" navbar>
                  <UncontrolledDropdown nav>
                    <div className={'small-screen-menu'}>
                      <DropdownToggle
                        style={{color: this.props.themeTextColor}}
                        caret
                        color="default"
                        data-toggle="dropdown"
                        nav
                        onClick={(e) => e.preventDefault()}
                      >
                        <IconButton
                          aria-controls="menu-list-grow"
                          style={{
                            borderColor: grey800,
                            width: '40px',
                            height: '40px',
                            padding: '0'
                          }}
                          aria-haspopup="true"
                        >
                          <img alt="..." src={this.state.avatar} width={'36px'} height={'36px'}
                               style={{borderRadius: '50%'}}/>
                        </IconButton>
                        {" "}
                        <b className="caret d-none d-lg-block d-xl-block"/>
                        <div className={'small-screen-menu-items'}>
                          <NavLink tag="div">
                            <DropdownItem className="nav-item"
                                          onClick={() => this.launchView('system/user-profile.json')}>
                              {" "}
                              Profile{" "}
                            </DropdownItem>{" "}
                          </NavLink>{" "}
                          <DropdownItem divider tag="div"/>
                          <NavLink tag="div">
                            <DropdownItem className="nav-item"
                                          onClick={this.props.logoutCallBack}>
                              {" "}
                              Log out{" "}
                            </DropdownItem>{" "}
                          </NavLink>{" "}
                        </div>
                      </DropdownToggle>{" "}
                    </div>
                    <DropdownMenu className="dropdown-navbar" end tag="ul">
                      <NavLink tag="li">
                        <DropdownItem className="nav-item"
                                      onClick={() => this.launchView('system/user-profile.json')}>
                          {" "}
                          Profile{" "}
                        </DropdownItem>{" "}
                      </NavLink>{" "}
                      <DropdownItem divider tag="li"/>
                      <NavLink tag="li">
                        <DropdownItem className="nav-item"
                                      onClick={this.props.logoutCallBack}>
                          {" "}
                          Log out{" "}
                        </DropdownItem>{" "}
                      </NavLink>{" "}
                    </DropdownMenu>{" "}
                  </UncontrolledDropdown>{" "}
                  <li className="separator d-lg-none"/>
                </Nav>{" "}
              </Collapse>{" "}
            </div>
          </div>
          {" "}
        </Navbar>{" "}
        <Modal
          modalClassName="modal-search"
          isOpen={this.state.modalSearch}
          toggle={this.toggleModalSearch}
        >
          <div className="modal-header">
            <Input id="inlineFormInputGroup" placeholder="SEARCH" type="text"/>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={this.toggleModalSearch}
            >
              <i className="tim-icons icon-simple-remove"/>
            </button>
            {" "}
          </div>
          {" "}
        </Modal>{" "}
      </>
    );
  }
}

export default HomeNavbar;
/*export default withRouter(connect(
    propHandler,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(HomeNavbar))*/
