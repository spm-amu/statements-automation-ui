import React from 'react';
import {LARGE, SMALL} from 'material-ui/utils/withWidth';
import PropTypes from 'prop-types';
import Utils from '../../common/Utils'
import ViewPort from "../../common/components/layout/ViewPort";
import {Route} from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import Sidebar from './components/blackDashboard/sidebar/Sidebar';
import HomeNavbar from "../../common/components/navbars/HomeNavbar";
import {useDispatch} from "react-redux";
import {actionCreators} from "../../common/redux/store/DashboardStore";
import "../../common/assets/scss/black-dashboard-react.scss";
import "./BasicBusinessAppDashboard.css"
import { useNavigate } from 'react-router-dom';

let ps;

const BasicBusinessAppDashboard = (props) => {
    const [navDrawerOpen, setNavDrawerOpen] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [activeColor, setActiveColor] = React.useState("blue");
    const [secondaryThemeColor, setSecondaryThemeColor] = React.useState("");
    const [primaryThemeColor, setPrimaryThemeColor] = React.useState("");
    const [themeTextColor, setThemeTextColor] = React.useState("");
    const [routes, setRoutes] = React.useState([]);
    const [utilsRoutes, setUtilsRoutes] = React.useState([]);
    const [logo, setLogo] = React.useState("data:image/png;base64," + props.logo);
    const [sidebarOpened, setSidebarOpened] = React.useState(document.documentElement.className.indexOf("nav-open") !== -1);
    const [sidebarMini, setSidebarMini] = React.useState(true);
    const [opacity, setOpacity] = React.useState(0);
    const navigate = useNavigate();

    //const dispatch = useDispatch();

    const handleChangeRequestNavDrawer = () => {
        setNavDrawerOpen(!navDrawerOpen);
    };

    const handleBgClick = color => {
        setActiveColor(color);
    };

    React.useEffect(() => {

        if (navigator.platform.indexOf("Win") > -1) {
            document.documentElement.classList.add("perfect-scrollbar-on");
            document.documentElement.classList.remove("perfect-scrollbar-off");
            let tables = document.querySelectorAll(".table-responsive");
            for (let i = 0; i < tables.length; i++) {
                ps = new PerfectScrollbar(tables[i]);
            }
        }
        window.addEventListener("scroll", showNavbarButton);
    });


    React.useEffect(() => {
        if (props.width !== null && typeof props.width !== 'undefined') {
            setNavDrawerOpen(props.width === LARGE);
        }
    }, [props.width]);

    React.useEffect(() => {
      if(loading) {
        document.body.classList.add("white-content");

        if (navigator.platform.indexOf("Win") > -1) {
          //ps.destroy();
          //document.documentElement.className.add("perfect-scrollbar-off");
          //document.documentElement.classList.remove("perfect-scrollbar-on");

        }

        window.removeEventListener("scroll", showNavbarButton);

        setActiveColor("agility");
        setSecondaryThemeColor('#342343');
        setPrimaryThemeColor('#498899');
        setThemeTextColor('#ffffff');
        //dispatch(actionCreators.setSecondaryThemeColor(props.settings.systemProfileDto.secondCorporateBrandColor));


        let newRoutes = [];
        let newRoute = {};

        newRoute.name = "Calendar";
        newRoute.path = "calendar";
        newRoute.icon = "CALENDER";
        newRoute.layout = "/admin";
        newRoute.level = 0;
        newRoute.isParent = true;
        newRoutes.push(newRoute);

        newRoute = {};
        newRoute.name = "Charts";
        newRoute.path = "charts";
        newRoute.icon = "CHARTS";
        newRoute.layout = "/admin";
        newRoute.level = 0;
        newRoute.isParent = true;
        newRoutes.push(newRoute);

        newRoute = {};
        newRoute.name = "Files";
        newRoute.path = "files";
        newRoute.icon = "FILES";
        newRoute.layout = "/admin";
        newRoute.level = 0;
        newRoute.isParent = true;
        newRoutes.push(newRoute);

        newRoute = {};
        newRoute.name = "Meeting history";
        newRoute.path = "meetingHistory";
        newRoute.icon = "MEETINGS";
        newRoute.layout = "/admin";
        newRoute.level = 0;
        newRoute.isParent = true;
        newRoutes.push(newRoute);


        let utilsRoutes = [];
        newRoute = {};
        newRoute.name = "Help";
        newRoute.path = "help";
        newRoute.icon = "HELP";
        newRoute.layout = "/admin";
        newRoute.level = 0;
        newRoute.isParent = true;
        utilsRoutes.push(newRoute);

        /*console.log(props.settings.systemProfileDto);
        if (!Utils.isNull(props.settings.systemProfileDto.modules)) {
            for (let i = 0; i < props.settings.systemProfileDto.modules.length; i++) {
                let module = props.settings.systemProfileDto.modules[i];
                let route = {};

                route.name = module.label;
                route.icon = module.icon;
                route.layout = "/admin";
                route.level = 0;

                if (module.menuBar && module.menuBar.menus.length > 0) {
                    route.collapse = true;
                    route.state = module.name + "Collapse";
                    route.views = getViews(module.menuBar.menus, 1);
                }

                newRoutes.push(route);
            }
        }*/

        /*if(props.settings.settingsMenu) {
            newRoute = {};

            newRoute.name = "Settings";
            newRoute.icon = "fa fa-cog";
            newRoute.layout = "/admin";
            newRoute.isParent = true;
            newRoute.collapse = true;
            newRoute.level = 0;
            newRoute.state = "settingsMenuCollapse";
            newRoute.views = getViews(props.settings.settingsMenu.menus, 1);

            newRoutes.push(newRoute);
        }*/

        setRoutes(newRoutes);
        setUtilsRoutes(utilsRoutes);

        //props.settings.dashboardMenu = createNewMenu.items.length > 0 ? dashboardMenu : null;
        setLoading(false);
        //}
      }
    });

    const getViews = (menus, level) => {
        let newViews = [];

        for (let i = 0; i < menus.length; i++) {
            let createView = {};
            createView.name = menus[i].attributes.label;
            createView.mini = "SS";
            createView.layout = "/admin";
            createView.level = level;

            if (menus[i].items && menus[i].items.length > 0) {
                createView.collapse = true;
                createView.state = menus[i].id + "Collapse";
                createView.views = getItems(menus[i].items, level + 1);
            }

            newViews.push(createView);
        }

        return newViews;
    };

    const getItems = (items, level) => {
        let newItems = [];

        for (let i = 0; i < items.length; i++) {
            let createItem = {};
            createItem.name = items[i].attributes.label;
            createItem.mini = "SS";
            createItem.layout = "/admin";
            createItem.item = items[i];
            createItem.level = level;

            if (!Utils.isNull(items[i].subMenu)) {
                createItem.collapse = true;
                createItem.state = items[i].id + "SubMenuCollapse";
                createItem.views = getItems(items[i].subMenu.items, level + 1);
            }

            newItems.push(createItem);
        }

        return newItems;
    };

    const toggleSidebar = () => {
        document.documentElement.classList.toggle("nav-open");
        setSidebarOpened(!sidebarOpened);
    };

    const showNavbarButton = () => {
        if (
            document.documentElement.scrollTop > 50 ||
            document.scrollingElement.scrollTop > 50
        ) {
            setOpacity(1);
        } else if (
            document.documentElement.scrollTop <= 50 ||
            document.scrollingElement.scrollTop <= 50
        ) {
            setOpacity(0);
        }
    };

    const getRoutes = (routes) => {
        return routes.map((prop, key) => {
            if (prop.collapse) {
                return getRoutes(prop.views);
            }
            if (prop.layout === "/admin") {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        component={prop.component}
                        key={key}
                    />
                );
            } else {
                return null;
            }
        });
    };

    const getActiveRoute = (routes) => {
        let activeRoute = "Dashboard";
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].collapse) {
                let collapseActiveRoute = getActiveRoute(routes[i].views);
                if (collapseActiveRoute !== activeRoute) {
                    return collapseActiveRoute;
                }
            } else {
                if (
                    window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
                ) {
                    return routes[i].name;
                }
            }
        }
        return activeRoute;
    };

    const handleActiveClick = (color) => {
        setActiveColor(color)
    };

    const handleMiniClick = () => {
        let notifyMessage = "Sidebar mini ";
        if (document.body.classList.contains("sidebar-mini")) {
            setSidebarMini(false);
            notifyMessage += "deactivated...";
        } else {
            setSidebarMini(true);
            notifyMessage += "activated...";
        }
        let options = {};
        options = {
            place: "tr",
            message: notifyMessage,
            type: "primary",
            icon: "tim-icons icon-bell-55",
            autoDismiss: 7,
        };
        document.body.classList.toggle("sidebar-mini");
    };

    const closeSidebar = () => {
        setSidebarOpened(false);
        document.documentElement.classList.remove("nav-open");
    };

    function launcDashboard() {
        applicationContext.closeCurrentView(false);
        applicationContext.getViewPortHistory().push("/switch");
        applicationContext.getViewPortHistory().push("/view/dashboard");
    }

    return (
        loading ?
            <div>Loading...</div>
            :
            <>
                <div className="wrapper" style={{height: '100%', overflow: 'hidden'}}>
                    <div
                        className="navbar-minimize-fixed"
                        style={{
                            opacity: opacity,
                        }}
                    >
                        <button
                            className="minimize-sidebar btn btn-link btn-just-icon"
                            onClick={handleMiniClick}
                        >
                            <i className="tim-icons icon-align-center visible-on-sidebar-regular text-muted"/>
                            <i className="tim-icons icon-bullet-list-67 visible-on-sidebar-mini text-muted"/>
                        </button>
                        {" "}
                    </div>
                    {" "}
                    <Sidebar
                        {...props}
                        routes={routes}
                        utilsRoutes={utilsRoutes}
                        activeColor={"agility"}
                        secondaryThemeColor={secondaryThemeColor}
                        activeRouteMenu={'calendar'}
                        className={"sidebar"}
                        viewLauncher={(path) => {
                          navigate('/view/' + path);
                        }}
                        appLogoPath={props.appLogoPath}
                        logo={{
                            outterLink: "",
                            text: "",
                            imgSrc: logo,
                        }}
                        closeSidebar={closeSidebar}
                    />{" "}
                    <div className="main-panel" data={activeColor}>
                        <div className="content">
                          <div style={{height: '136px'}}>
                            <HomeNavbar
                              {...props}
                              color={"#FFFFFF"}
                              themeTextColor={"#ADA7A7"}
                              handleMiniClick={handleMiniClick}
                              brandText={getActiveRoute(routes)}
                              sidebarOpened={sidebarOpened}
                              avatar={props.avatar}
                              settingsMenu={null}
                              toggleSidebar={toggleSidebar}
                              logoutCallBack={props.logoutCallBack}
                            />{" "}
                          </div>
                          <div>
                            <ViewPort settings={props.settings}/>
                          </div>
                        </div>

                        {/*<HomeFooter fluid /> {" "}*/}
                    </div>
                    {" "}
                </div>
            </>

    );
};

BasicBusinessAppDashboard.propTypes = {
    children: PropTypes.element,
    width: PropTypes.number
};

export default BasicBusinessAppDashboard;

