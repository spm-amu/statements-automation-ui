import React, {useEffect, useState} from 'react';
import {LARGE} from 'material-ui/utils/withWidth';
import PropTypes from 'prop-types';
import Utils from '../../common/Utils'
import ViewPort from "../../common/components/layout/ViewPort";
import {Route, useNavigate} from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import Sidebar from './components/blackDashboard/sidebar/Sidebar';
import HomeNavbar from "../../common/components/navbars/HomeNavbar";
import "../../common/assets/scss/black-dashboard-react.scss";
import "./BasicBusinessAppDashboard.css"
import {get, host} from "../../common/service/RestService";
import socketManager from "../../common/service/SocketManager";
import appManager from "../../common/service/AppManager";
import tokenManager from "../../common/service/TokenManager";
import {MessageType, SystemEventType} from '../../common/types';
const { electron } = window;
import LottieIcon from "../../common/components/LottieIcon";

let ps;

const newMessageAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/message.mp3');

const BasicBusinessAppDashboard = (props) => {
  const [navDrawerOpen, setNavDrawerOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [userDetails, setUserDetails] = React.useState(null);
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
  const [tokenRefreshMonitorStarted, setTokenRefreshMonitorStarted] = React.useState(null);
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

  const init = () => {

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

    let newRoutes = [];
    let newRoute = {};

    newRoute.name = "Calendar";
    newRoute.path = "calendar";
    newRoute.icon = "CALENDAR";
    newRoute.layout = "/admin";
    newRoute.level = 0;
    newRoute.isParent = true;
    newRoutes.push(newRoute);

    newRoute = {};
    newRoute.name = "People";
    newRoute.path = "people";
    newRoute.icon = "PEOPLE";
    newRoute.layout = "/admin";
    newRoute.level = 0;
    newRoute.isParent = true;
    newRoutes.push(newRoute);

    newRoute = {};
    newRoute.name = "Chats";
    newRoute.path = "chats";
    newRoute.icon = "CHATS";
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

    setRoutes(newRoutes);
    setUtilsRoutes(utilsRoutes);

    //props.settings.dashboardMenu = createNewMenu.items.length > 0 ? dashboardMenu : null;
    setLoading(false);
    //}
  };

  const systemEventHandlerApi = () => {
    return {
      get id() {
        return 'dashboard-system-event-handler-api';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case SystemEventType.UNAUTHORISED_API_CALL:
            navigate('/login');
            break;
        }
      }
    }
  };

  const socketEventHandlerApi = () => {
    return {
      get id() {
        return 'global-1223';
      },
      on: (eventType, be) => {
        switch (eventType) {
          case MessageType.RECEIVING_CALL:
            receiveCall(be.payload);
            break;
          case MessageType.CANCEL_CALL:
            cancelCall(be.payload);
            break;
          case MessageType.CHAT_MESSAGE:
            onChatMessage(be.payload);
            break;
          case MessageType.SYSTEM_ALERT:
            onSystemAlert(be.payload);
            break;
        }
      }
    }
  };

  const socketEventHandler = useState({
    api: socketEventHandlerApi()
  });

  const systemEventHandler = useState({
    api: systemEventHandlerApi()
  });

  const onChatMessage = (payload) => {
    console.log('ON CHAT DASH: ', payload);

    let loggedInUser = appManager.getUserDetails();

    if (payload.message.participant.userId !== loggedInUser.userId) {
      newMessageAudio.play();

      electron.ipcRenderer.sendMessage('receivingMessage', {
        payload: payload
      });
    }
  };

  const cancelCall = (payload) => {
    electron.ipcRenderer.sendMessage('cancelCall', {});
  };

  const onSystemAlert = (payload) => {
    electron.ipcRenderer.sendMessage('systemAlert', {
      payload: payload
    });
  };

  const receiveCall = (payload) => {
    electron.ipcRenderer.sendMessage('receivingCall', {
      payload: payload
    });
  };

  const onAnswerCall = () => {
    electron.ipcRenderer.on('answerCall', args => {
      navigate("/view/meetingRoom", {
        state: {
          displayMode: 'window',
          selectedMeeting: {
            id: args.payload.roomId
          },
          videoMuted: true,
          audioMuted: false,
          isDirectCall: true
        }
      })
    });
  };

  const joinMeeting = () => {
    electron.ipcRenderer.on('joinMeetingEvent', args => {
      get(`${host}/api/v1/meeting/fetch/${args.payload.params.meetingId}`, (response) => {
        let userDetails = appManager.getUserDetails();
        let isHost = false;
        response.extendedProps.attendees.forEach(att => {
          if (att.userId === userDetails.userId) {
            isHost = att.type === 'HOST';
          }
        });

        navigate("/view/meetingRoom", {
          state: {
            displayMode: 'window',
            selectedMeeting: {
              id: response.id
            },
            videoMuted: true,
            audioMuted: true,
            isHost
          }
        })
      }, (e) => {
      });
    });
  };

  const onDeclineCall = () => {
    electron.ipcRenderer.on('declineCall', args => {
      if (args.payload.callerId) {
        socketManager.endDirectCall(args.payload.callerId);
      }
    });
  };

  const joinChatRooms = () => {
    get(`${host}/api/v1/chat/fetchChats`, (response) => {
      const ids = response.map(chat => chat.id);

      socketManager.chatEvents = response;

      socketManager.emitEvent(MessageType.JOIN_CHAT_ROOM, {
        socketId: socketManager.socket.id,
        rooms: ids
      });
    }, (e) => {
    })
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
    systemEventHandler.api = systemEventHandlerApi();
  });

  React.useEffect(() => {
    appManager.addSubscriptions(systemEventHandler, SystemEventType.UNAUTHORISED_API_CALL);
    //if (loading) {
      if (Utils.isNull(Utils.getCookie("accessToken"))) {
        navigate('/login');
      } else {
        get(`${host}/api/v1/auth/userInfo`, (response) => {
          appManager.setUserDetails(response);
          setUserDetails(response);
          init();
          socketManager.init();
          socketManager.addSubscriptions(socketEventHandler, MessageType.RECEIVING_CALL, MessageType.CANCEL_CALL, MessageType.CHAT_MESSAGE, MessageType.SYSTEM_ALERT);

          if (!tokenRefreshMonitorStarted) {
            tokenManager.startTokenRefreshMonitor( `${host}/api/v1/auth/refresh`, response.username);
            setTokenRefreshMonitorStarted(true);
          }

          onAnswerCall();
          onDeclineCall();
          joinChatRooms();
          joinMeeting();
        }, (e) => {
        })
      }
    //}
  }, []);

  React.useEffect(() => {
    return () => {
      appManager.clearAllEventListeners();
      socketManager.clearAllEventListeners();
      socketManager.disconnectSocket();
    };
  }, []);

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
    const toggleEvent = new CustomEvent("sideBarToggleEvent", {
      detail: {
        open: !sidebarOpened
      }
    });

    setSidebarOpened(!sidebarOpened);
    document.dispatchEvent(toggleEvent);
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
    loading || !userDetails ?
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
        <LottieIcon id={'waiting'}/>
      </div>
      :
      <>
        <div className="wrapper" style={{height: '100%', overflow: 'hidden'}}>
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
                  brandText={getActiveRoute(routes)}
                  sidebarOpened={sidebarOpened}
                  userDetails={userDetails}
                  avatar={props.avatar}
                  settingsMenu={null}
                  toggleSidebar={toggleSidebar}
                  logoutCallBack={(e) => {
                    sessionStorage.setItem("access_token", null);
                    sessionStorage.setItem("userDetails", null);
                    navigate("/login");
                  }}
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

