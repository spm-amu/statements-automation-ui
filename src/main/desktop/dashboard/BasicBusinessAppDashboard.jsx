import React, {useEffect, useState} from 'react';
import {LARGE} from 'material-ui/utils/withWidth';
import PropTypes from 'prop-types';
import Utils from '../../common/Utils'
import ViewPort from "../../common/components/layout/ViewPort";
import {Route, useLocation, useNavigate} from 'react-router-dom';
import PerfectScrollbar from "perfect-scrollbar";
import Sidebar from './components/blackDashboard/sidebar/Sidebar';
import HomeNavbar from "../../common/components/navbars/HomeNavbar";
import "../../common/assets/scss/black-dashboard-react.scss";
import "./BasicBusinessAppDashboard.css"
import {get, post} from '../../common/service/RestService';
import socketManager from "../../common/service/SocketManager";
import appManager from "../../common/service/AppManager";
import Button from "@material-ui/core/Button";
import tokenManager, {
  ACCESS_TOKEN_PROPERTY,
  LAST_LOGIN,
  REFRESH_TOKEN_PROPERTY
} from "../../common/service/TokenManager";
import {MessageType, SystemEventType} from '../../common/types';
import LottieIcon from "../../common/components/LottieIcon";
import LoadingIndicator from "../../common/components/LoadingIndicator";
import Alert from "react-bootstrap/Alert";
import {isChrome, isEdge, isIE, isSafari} from 'react-device-detect';

const {electron} = window;

let ps;

const MODE = "DEBUG";
const newMessageAudio = new Audio('https://armscor-audio-files.s3.amazonaws.com/message.mp3');

const BasicBusinessAppDashboard = (props) => {
  const [navDrawerOpen, setNavDrawerOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [networkErrorMessage, setNetworkErrorMessage] = React.useState(true);
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
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [tokenRefreshMonitorStarted, setTokenRefreshMonitorStarted] = React.useState(null);
  const [socketEventHandler] = useState({});
  const [systemEventHandler] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [activityMessage, setActivityMessage] = useState(null);

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

  const initDashboardSettings = () => {

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

    newRoute.name = "Activity";
    newRoute.path = "activity";
    newRoute.icon = "NOTIFICATIONS";
    newRoute.layout = "/admin";
    newRoute.level = 0;
    newRoute.isParent = true;
    newRoute.hasNotificationListener = true;
    newRoutes.push(newRoute);

    newRoute = {};
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
    newRoute.icon = "CHAT_BUBBLE";
    newRoute.layout = "/admin";
    newRoute.level = 0;
    newRoute.isParent = true;
    newRoutes.push(newRoute);

    newRoute = {};
    newRoute.name = "Files";
    newRoute.path = "files";
    newRoute.icon = "FOLDER";
    newRoute.layout = "/admin";
    newRoute.level = 0;
    newRoute.isParent = true;
    newRoutes.push(newRoute);

    newRoute = {};
    newRoute.name = "Meeting history";
    newRoute.path = "meetingHistory";
    newRoute.icon = "HISTORY";
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

    if ((isSafari || isChrome || isIE || isEdge) && location.state && location.state.guest) {
      setRoutes([]);
    } else {
      setRoutes(newRoutes);
    }

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

            appManager.remove("accessToken");
            appManager.remove("refreshToken");
            appManager.remove("lastLogin");

            navigate('/login');
            break;
          case SystemEventType.API_ERROR:
            handleApiError(be);
            break;
          case SystemEventType.API_SUCCESS:
            handleApiSuccess(be);
            break;
        }
      }
    }
  };

  const handleApiError = (error) => {
    setErrorMessage(error.message);
  };

  const handleApiSuccess = (event) => {
    if (event.message && event.message.length > 0) {
      setSuccessMessage(event.message);
      const messageTimeout = setTimeout(() => {
        setSuccessMessage(null);
        clearTimeout(messageTimeout);
      }, event.timeout ? event.timeout : 2000)
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
          case MessageType.CALL_REJECTED:
            handleCallRejection(be.payload);
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

  const onChatMessage = (payload) => {
    let loggedInUser = appManager.getUserDetails();
    if (payload.chatMessage.participant.userId !== loggedInUser.userId) {
      newMessageAudio.play();

      let currentchat = appManager.get('CURRENT_CHAT');
      let isChatScreenOpen = appManager.getCurrentView() === 'chats';

      if (!payload.skipAlert && !currentchat && !isChatScreenOpen) {
        electron.ipcRenderer.sendMessage('receivingMessage', {
          payload: payload
        });
      } else if (isChatScreenOpen || currentchat) {
        if (currentchat && currentchat.id !== payload.roomId) {
          appManager.fireEvent(SystemEventType.ACTIVE_CHAT_CHANGED, {
            payload: payload
          });
        } else if (!currentchat) {
          appManager.fireEvent(SystemEventType.FIRST_CHAT_ARRIVED, {
            payload: payload
          });
        }
      }
    }
  };

  const cancelCall = (payload) => {
    electron.ipcRenderer.sendMessage('cancelCall', {});
  };

  const onSystemAlert = (payload) => {
    let args = {
      payload: payload
    };

    if (appManager.get('CURRENT_MEETING')) {
      args.currentMeetingId = appManager.get('CURRENT_MEETING').id;
    }

    console.log(payload);

    // Do not pop if there is a running meeting and either of these events are received
    if (!(appManager.get('CURRENT_MEETING')
      && (payload.type === 'MEETING_START_ALERT' || payload.type === 'MEETING_STARTED_ALERT'))) {
      electron.ipcRenderer.sendMessage('systemAlert', args);
    }
  };


  const handleCallRejection = (payload) => {
    handleMessageArrived({
      message: payload.rejectedBy + ' rejected the call with this reason : ' + payload.reason
    });

    // TODO : We had to do this as a temporary major. Without this hack the call re-dials itself. Remove the lines below to observe
    navigate('/view/calendar');
    navigate('/view/people');
  };

  const receiveCall = (payload) => {
    if (appManager.get('CURRENT_MEETING')) {
      socketManager.declineDirectCall(payload.callerUser.socketId, payload.roomId, "In another meeting");
    } else {
      electron.ipcRenderer.sendMessage('receivingCall', {
        payload: payload
      });
    }
  };

  useEffect(() => {
    socketEventHandler.api = socketEventHandlerApi();
    systemEventHandler.api = systemEventHandlerApi();
  });

  function setup(response, isRedirect = false) {
    appManager.setUserDetails(response);
    setUserDetails(response);
    initDashboardSettings();
    socketManager.init();
    socketManager.addSubscriptions(socketEventHandler, MessageType.CALL_REJECTED, MessageType.RECEIVING_CALL, MessageType.CANCEL_CALL, MessageType.CHAT_MESSAGE, MessageType.SYSTEM_ALERT);

    if (!tokenRefreshMonitorStarted) {
      tokenManager.startTokenRefreshMonitor(`${appManager.getAPIHost()}/api/v1/auth/refresh`, response.username);
      setTokenRefreshMonitorStarted(true);
    }

    if (isRedirect) {
      window.history.replaceState({}, document.title); // clear location.state
      redirectToMeeting(location.state);
    }
  }

  function load() {
    let accessToken = appManager.get(ACCESS_TOKEN_PROPERTY);
    let refreshToken = appManager.get(REFRESH_TOKEN_PROPERTY);

    if (Utils.isNull(accessToken) || Utils.isNull(refreshToken)) {
      navigate('/login');
    } else {
      get(`${appManager.getAPIHost()}/api/v1/auth/userInfo`, (response) => {
        const isRedirect = location.state && location.state.meetingId;
        setup(response, isRedirect);
      }, (e) => {
        if (e.status === 401) {
          console.log("DASHBOARD REFRESH");
          if (refreshToken) {
            get(`${appManager.getAPIHost()}/api/v1/auth/refresh?refreshToken=${refreshToken}`, (response) => {
              electron.ipcRenderer.sendMessage('saveTokens', {
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                reload: true
              });
            }, (e) => {
              navigate('/login');
            }, null, true, false)
          }
        }
      });
    }
  }

  const redirectToMeeting = (params, redirect = false) => {
    let userDetails = appManager.getUserDetails();

    let meetingRedirectId =
      params.selectedMeeting && params.selectedMeeting.id ? params.selectedMeeting.id : params.meetingId;

    get(`${appManager.getAPIHost()}/api/v1/meeting/fetch/${meetingRedirectId}`, (response) => {
      if (response.extendedProps.status === 'CANCELLED') {
        appManager.fireEvent(SystemEventType.API_ERROR, {
          message: 'The meeting has been cancelled.'
        });
      } else {
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
              id: response.id,
              title: response.title
            },
            videoMuted: true,
            audioMuted: true,
            isHost
          }
        })
      }
    }, (e) => {
    }, '', false);
  };

  function init() {
    appManager.addSubscriptions(systemEventHandler, SystemEventType.UNAUTHORISED_API_CALL, SystemEventType.API_ERROR, SystemEventType.API_SUCCESS);
    if (!isSafari && !isChrome && !isIE && !isEdge) {
      electron.ipcRenderer.on('tokensRead', args => {

        console.log('______ PATHS: ', args);

        if (args.accessToken && args.refreshToken) {
          appManager.add(ACCESS_TOKEN_PROPERTY, args.accessToken);
          appManager.add(REFRESH_TOKEN_PROPERTY, args.refreshToken);
          appManager.add(LAST_LOGIN, args.lastLogin);

          load();
        } else {
          navigate('/login');
        }

        electron.ipcRenderer.removeAllListeners("tokensRead");
      });

      electron.ipcRenderer.on('tokensRemoved', args => {
        // TODO : Call backend and revoke access and refresh token
      });

      electron.ipcRenderer.on('replyMessage', args => {
        navigate("/view/chats", {
          state: {
            chatId: args.chatId,
          }
        })
      });

      electron.ipcRenderer.on('answerCall', args => {
        console.log("\n\n\n\nANSWERING CALLL.....", args);
        post(
          `${appManager.getAPIHost()}/api/v1/meeting/answerCall`,
          (response) => {
            navigate("/view/meetingRoom", {
              state: {
                displayMode: 'window',
                selectedMeeting: {
                  id: args.payload.roomId
                },
                videoMuted: true,
                audioMuted: false,
                isDirectCall: !args.payload.meetingJoinRequest,
                isRequestToJoin: args.payload.meetingJoinRequest,
                callerUser: args.payload.meetingJoinRequest ? null : args.payload.callerUser
              }
            })
          },
          (e) => {
          },
          {
            callId: args.payload.roomId,
            caller: args.payload.callerUser.userId
          },
          null
        );
      });

      electron.ipcRenderer.on('joinMeetingEvent', args => {
        let accessToken = appManager.get(ACCESS_TOKEN_PROPERTY);
        let refreshToken = appManager.get(REFRESH_TOKEN_PROPERTY);

        if (args.payload.params.redirect) {
          post(
            `${appManager.getAPIHost()}/api/v1/auth/validateMeetingToken`,
            (response) => {
              if (Utils.isNull(accessToken) || Utils.isNull(refreshToken)) {
                navigate('/login', {
                  state: {
                    meetingId: args.payload.params.meetingId,
                    tokenUserId: response.userId,
                    token: args.payload.params.accessToken
                  }
                });
              } else {
                const data = args.payload.params;
                data.emailAddress = response.attendeeName;
                redirectToMeeting(data, true);
              }
            },
            (e) => {
              appManager.fireEvent(SystemEventType.API_ERROR, {
                message: 'Invalid meeting link.'
              });
            },
            {
              token: args.payload.params.accessToken
            },
            ''
          );
        } else {
          redirectToMeeting(args.payload.params);
        }
      });

      electron.ipcRenderer.on('declineCall', args => {
        console.log(args.payload);
        if (args.payload.callerId) {
          socketManager.declineDirectCall(args.payload.callerId, args.payload.callPayload.roomId, args.payload.reason);
        }
      });

      electron.ipcRenderer.sendMessage('readTokens', {});
    } else {
      const guestNaviationData = location.state;

      console.log('_____ guestNaviationData: ', guestNaviationData);

      if (guestNaviationData && guestNaviationData.accessToken && guestNaviationData.refreshToken) {
        appManager.add(ACCESS_TOKEN_PROPERTY, guestNaviationData.accessToken);
        appManager.add(REFRESH_TOKEN_PROPERTY, guestNaviationData.refreshToken);
        appManager.add(LAST_LOGIN, guestNaviationData.lastLogin);

        if (guestNaviationData.guest) {
          setup(guestNaviationData.guest, true);
        } else {
          load();
        }
      } else {
        navigate('/login');
      }
    }
  }

  function loadHost(apiHost, signalingServerHost, online = true) {
    appManager.setAPIHost(apiHost);
    appManager.setSignalingServerHost(signalingServerHost);
    appManager.setOnline(online);
    setNetworkErrorMessage(null);
    init();
  }

  React.useEffect(() => {
    if (MODE === 'PROD') {
      get("http://DEVHOVC03/vc/api/v1/system/ping", (e) => {
        loadHost("http://DEVHOVC03/vc", "http://DEVHOVC03", false);
      }, (e) => {
        get("https://svn.agilemotion.co.za/vc/api/v1/system/ping", (e) => {
          loadHost("https://svn.agilemotion.co.za/vc", "https://svn.agilemotion.co.za");
        }, (e) => {
          setNetworkErrorMessage("A network error has occurred while connecting to the server. Please contact your system administrator");
        }, "", true, false);
      }, "", true, false);
    } else {
      loadHost("http://localhost:8080/vc", "http://localhost:8000");
    }
  }, []);

  React.useEffect(() => {
    return () => {
      socketManager.removeSubscriptions(socketEventHandler);
      appManager.removeSubscriptions(systemEventHandler);

      appManager.clearAllEventListeners();
      socketManager.clearAllEventListeners();
      socketManager.disconnectSocket();

      if (!isSafari && !isChrome && !isIE && !isEdge) {
        electron.ipcRenderer.removeAllListeners("tokensRemoved");
        electron.ipcRenderer.removeAllListeners("answerCall");
        electron.ipcRenderer.removeAllListeners("joinMeetingEvent");
        electron.ipcRenderer.removeAllListeners("declineCall");
      }
    };
  }, []);

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

  const handleMessageArrived = (event) => {
    if (event.message && event.message.length > 0) {
      setActivityMessage(event.message);
      const messageTimeout = setTimeout(() => {
        setActivityMessage(null);
        clearTimeout(messageTimeout);
      }, 4000)
    }
  };

  const closeSidebar = () => {
    setSidebarOpened(false);
    document.documentElement.classList.remove("nav-open");
  };

  return (
    loading ?
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
        <LottieIcon id={'waiting'}/>
      </div>
      :
      networkErrorMessage ?
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'red'}}>
          {networkErrorMessage}
        </div>
        :
        userDetails &&
          <>
            <div className="wrapper" style={{height: '100%', overflow: 'hidden'}}>
              <LoadingIndicator color={"#945c33"}/>
              <Sidebar
                {...props}
                routes={routes}
                utilsRoutes={utilsRoutes}
                activeColor={"agility"}
                secondaryThemeColor={secondaryThemeColor}
                activeRouteMenu={'calendar'}
                className={"sidebar"}
                viewLauncher={(path) => {
                  appManager.setCurrentView(path);
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
                  <div style={{height: '48px'}}>
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
                        appManager.remove("accessToken");
                        appManager.remove("refreshToken");
                        appManager.remove("lastLogin");

                        tokenManager.stopTokenRefreshMonitor();

                        if (!isSafari && !isChrome && !isIE && !isEdge) {
                          electron.ipcRenderer.sendMessage('removeTokens', {});
                        }

                        navigate("/login");
                      }}
                    />{" "}
                  </div>
                  <div>
                    <div style={{
                      padding: '0 32px 0 32px',
                      maxHeight: '64px',
                      width: '90%',
                      zIndex: '1200',
                      position: 'absolute'
                    }}>
                      <Alert
                        variant={'danger'}
                        show={errorMessage !== null}
                        fade={true}
                        onClose={() => {
                          setErrorMessage(null)
                        }}
                        dismissible
                      >
                        <Alert.Heading>Error</Alert.Heading>
                        <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{errorMessage}</p>
                      </Alert>
                      <Alert
                        variant={'success'}
                        show={successMessage !== null}
                        fade={true}
                      >
                        <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{successMessage}</p>
                      </Alert>

                      <Alert
                        variant={'danger'}
                        show={activityMessage !== null}
                        fade={true}
                      >
                        <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{activityMessage}</p>
                      </Alert>
                    </div>
                    <ViewPort/>
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

