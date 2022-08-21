/*eslint-disable*/
import React from "react";
import {NavLink, withRouter} from "react-router-dom";
import PropTypes from "prop-types";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import Utils from "../../../../../common/Utils";

// reactstrap components
import {Nav, Collapse} from "reactstrap";
import MenuLink from "../../../../../common/components/menu/MenuLink";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {actionCreators} from "../../../../../common/redux/store/DashboardStore";
import CardAvatar from "../../../../../common/components/card/CardAvatar";
import {lighten} from "@material-ui/core";

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
        this.state = this.getCollapseStates(props.routes);
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

            if ((prop.collapse || prop.isParent) && prop.name !== 'Dashboard' && prop.name !== 'My Work Items') {
                var st = {};
                st[prop["state"]] = !this.state[prop.state];
                return (
                    <li
                        className={prop.collapse ? this.getCollapseInitialState(prop.views) ? "active" : null : null}
                        key={key}
                    >
                        <a
                            href="#pablo"
                            data-toggle="collapse"
                            style={{marginLeft: ((prop.level + 1) * TAB) + 'px'}}
                            aria-expanded={this.state[prop.state]}
                            onClick={(e) => {
                                e.preventDefault();
                                this.setState(st);
                            }}
                        >
                            {prop.icon !== undefined ? (
                                <>
                                    <i className={prop.icon} style={{width: '28px'}}/>{" "}
                                    <span>
                                        {" "}
                                        {prop.name}
                                        {" "}
                                        {
                                            prop.collapse ?
                                                <span className="caret" style={{marginTop: '0'}}/>
                                                :
                                                null
                                        }
                                    </span>{" "}
                                    {" "}
                                </>
                            ) : (
                                <>
                                    <span className="sidebar-normal" style={{paddingLeft: "4px"}}>
                                    {" "}
                                        {prop.name}
                                        {" "}
                                        <b className="caret"/>
                                  </span>
                                    {" "}
                                </>
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
                    style={this.activeRoute(prop.name) ?
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
                        clickCallback={prop.name === 'Dashboard' ? this.props.dashboardLauncher : null}
                        autoClick={prop.name === 'My Work Items' || (prop.item && prop.item.defaultItem)}
                        viewId="menuBar"
                        icon={prop.icon}
                        iconColor={(prop.name === 'Dashboard' || prop.name === 'My Work Items') && this.activeRoute(prop.name) ? secondaryThemeColor : null}
                        name={prop.name}
                        level={prop.level}
                        color={this.activeRoute(prop.name) ? secondaryThemeColor : null}
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
                        <img src={logo.imgSrc} alt="react-logo"/>
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
                 style={{overflow: 'auto', maxHeight: '100vh', border: '8px solid blue'}}>
                <table style={{height: "96%", maxHeight: "100%", width: "100%"}}>
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
                        <td style={{height: '70%'}} valign={"top"}>
                            <Nav style={{margin: "8px", padding: "16px"}}>
                                {this.createLinks(this.props.routes)}
                            </Nav>
                        </td>
                    </tr>
                    <tr>
                        <td style={{height: '10%'}} valign={"top"}>
                            <div className={"sidebar-app-logo"} style={{justifyContent: 'center', height: '92px'}}>
                                {
                                    !Utils.isNull(this.props.appLogoPath) ?
                                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <CardAvatar plain>
                                                <img src={this.props.appLogoPath} alt="..."/>
                                            </CardAvatar>
                                        </div>
                                        :
                                        null

                                }
                                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px'}}>
                                    Copyrights &copy; {1900 + new Date().getYear()} {" "}
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
