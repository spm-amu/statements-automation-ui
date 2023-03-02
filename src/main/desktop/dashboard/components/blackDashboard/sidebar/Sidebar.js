/*eslint-disable*/
import React from "react";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";
// javascript plugin used to create scrollbars on windows
import Utils from "../../../../../common/Utils";
import "./Sidebar.css"
// reactstrap components
import {Collapse, Nav} from "reactstrap";
import MenuLink from "../../../../../common/components/menu/MenuLink";
import {lighten} from "@material-ui/core";
import Icon from "../../../../../common/components/Icon";
import NotificationListener from "../../NoticationListener";

let ps;

const TAB = 8;
const propHandler = (state) => {
  let activeRouteMenu = state.dashboard.activeRouteMenu;

  return {
    activeRouteMenu: activeRouteMenu
  };
};

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collaspeState: this.getCollapseStates(props.routes),
      selectedMenuItem: 'calendar'
    }
    //actionCreators.setActiveRoute(Utils.isNull(props.activeRouteMenu) ? 'Dashboard' : props.activeRouteMenu);
  }

  // this creates the intial state of this component based on the collapse routes
  // that it gets through this.props.routes
  getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState,
        };
      }

      return null;
    });

    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.js - route /admin/regular-forms
  getCollapseInitialState(routes) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.href.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  }

  // this function creates the links and collapses that appear in the sidebar (left menu)
  createLinks = (routes) => {
    const {rtlActive, secondaryThemeColor} = this.props;
    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null;
      }

      if ((prop.collapse || prop.isParent)) {
        var st = {};
        st[prop["state"]] = !this.state[prop.state];
        return (
          <li
            className={this.state.selectedMenuItem === prop.path ? "menu-item-active" : 'menu-item'}
            key={key} onClick={(e) => {
            if (prop.path !== 'help') {
              this.state.selectedMenuItem = prop.path;
            }

            this.props.viewLauncher(prop.path);
          }}
          >
            <a
              href="#pablo"
              data-toggle="collapse"
              style={{marginLeft: ((prop.level) * TAB) + 'px', width: '100%'}}
              aria-expanded={this.state[prop.state]}
              onClick={(e) => {
                e.preventDefault();
                this.setState(st);
              }}
            >
              {prop.icon !== undefined ? (
                <table style={{width: '100%'}}>
                  <tbody>
                  <tr>
                    <td className={'menu-item-icon'}>
                      <Icon id={prop.icon}/>{" "}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {
                        prop.hasNotificationListener &&
                        <NotificationListener/>
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className={'menu-item-label'}>
                      {prop.name}
                    </td>
                  </tr>
                  </tbody>
                </table>
              ) : (
                <div>
                  <div className="sidebar-normal">
                    {" "}
                    {prop.name}
                    {" "}
                    <b className="caret"/>
                  </div>
                  {" "}
                </div>
              )}
              {" "}
            </a>{" "}
            {prop.collapse ?
              <Collapse isOpen={this.state[prop.state]}>
                <ul className="nav"> {this.createLinks(prop.views)} </ul>
                {" "}
              </Collapse>
              :
              null}
          </li>
        );
      }

      return (
        <li className={""} key={key}
            style={this.activeRoute(prop.path) ?
              {
                backgroundColor: lighten(secondaryThemeColor, .9),
                borderRadius: '16px',
                color: secondaryThemeColor,
                fontWeight: 500,
                marginRight: '8px',
              }
              :
              {}}
        >
          <MenuLink
            config={prop.item}
            clickCallback={this.props.viewLauncher}
            autoClick={prop.item && prop.item.defaultItem}
            viewId="menuBar"
            icon={prop.icon}
            iconColor={this.activeRoute(prop.path) ? secondaryThemeColor : null}
            name={prop.name}
            level={prop.level}
            color={this.activeRoute(prop.path) ? secondaryThemeColor : null}
          />
          {" "}
        </li>
      );
    });
  };
  // verifies if routeName is the one active (in browser input)
  activeRoute = (routeName) => {
    // return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    return this.props.activeRouteMenu === routeName;
  };

  componentDidMount() {
    // if you are using a Windows Machine, the scrollbars will have a Mac look
    if (navigator.platform.indexOf("Win") > -1) {
      /*ps = new PerfectScrollbar(this.refs.sidebar, {
          suppressScrollX: true,
          suppressScrollY: false,
      });*/
    }
  }

  componentWillUnmount() {
    // we need to destroy the false scrollbar when we navigate
    // to a page that doesn't have this component rendered
    if (navigator.platform.indexOf("Win") > -1) {
      //ps.destroy();
    }
  }

  render() {
    const {activeColor, logo} = this.props;
    let logoImg = null;
    let logoText = null;
    if (!Utils.isNull(logo)) {
      logoImg = (
        <a
          href={logo.outterLink}
          className="logo-normal"
          onClick={this.props.closeSidebar}
        >
          <div className="logo-img" style={{paddingTop: '16px', paddingBottom: '8px'}}>
            <img width={'64px'} src={require('/assets/armscor_logo.png')} alt="logo"/>
          </div>
          {" "}
        </a>
      );
      logoText = (
        <a
          href={logo.outterLink}
          className="simple-text "
          onClick={this.props.closeSidebar}
        >
          {logo.text}{" "}
        </a>
      );
    }

    return (
      <div className={this.props.className} data={activeColor}
           style={{overflow: 'auto', maxHeight: '100vh'}}>
        <table style={{height: "96%", maxHeight: "90%", width: "100%"}}>
          <tbody>
          <tr>
            <td style={{height: '10%'}}>
              {" "}
              {logoImg !== null ? (
                <div className="logo" style={
                  {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',

                  }}
                >
                  {" "}
                  {logoImg}
                  {" "}
                </div>
              ) : null}
              {" "}
              {!Utils.isNull(this.props.heading) ? (
                <div className="logo" style={
                  {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    fontSize: '20px',
                    fontWeight: 600

                  }}
                >{this.props.heading}</div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td style={{height: '65%'}} valign={"top"}>
              <Nav style={{margin: "8px"}}>
                {this.createLinks(this.props.routes)}
              </Nav>
            </td>
          </tr>
          <tr>
            <td className={'utils-menu'} valign={"top"}>
              <div className={"sidebar-app-logo"} style={{justifyContent: 'center', height: '92px'}}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px'}}>
                  <table style={{width: '100%'}}>
                    <tbody>
                    <tr>
                      <td>
                        <Nav style={{margin: "8px", padding: "16px 0"}}>
                          {this.createLinks(this.props.utilsRoutes)}
                        </Nav>
                      </td>
                    </tr>
                    <tr>
                      <td className={'copyright'}>
                        Copyrights &copy; {1900 + new Date().getYear()} {" "}
                      </td>
                    </tr>
                    <tr>
                      <td className={'copyright'} style={{ alignItems: 'center', justifyContent: 'center', display: "flex" }}>
                        <span style={{ fontWeight: 'bold' }}>v1.1.0</span>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

Sidebar.propTypes = {
  activeColor: PropTypes.oneOf(["primary", "blue", "green", "orange", "red", "agility"]),
  secondaryThemeColor: PropTypes.string.isRequired,
  rtlActive: PropTypes.bool,
  routes: PropTypes.array.isRequired,
  logo: PropTypes.oneOfType([
    PropTypes.shape({
      innerLink: PropTypes.string.isRequired,
      imgSrc: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      outterLink: PropTypes.string.isRequired,
      imgSrc: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ]),
  // this is used on responsive to close the sidebar on route navigation
  closeSidebar: PropTypes.func,
};

export default Sidebar;
/*export default withRouter(connect(
    propHandler,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Sidebar))*/
