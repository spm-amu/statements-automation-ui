const requestType = 'REQUEST';
const receiveDashboardSettingsType = 'RECEIVE_DASHBOARD_SETTINGS';
const activeRouteMenu = 'ACTIVE_ROUTE_MENU';
const secondaryThemeColor = 'SECONDARY_THEME_COLOR';

const initialState = {
    dashboardSettings: {}, isLoading: false, error: false, activeRouteMenu: "Dashboard", secondaryThemeColor: "red"
};

let currentDashboardSettings = {};
export const actionCreators = {
    setActiveRoute: (route) => async (dispatch) => {
        dispatch({ type: activeRouteMenu, activeRouteMenu: route });
    },
    setSecondaryThemeColor: (secondaryColor) => async (dispatch) => {
        dispatch({ type: secondaryThemeColor, secondaryThemeColor: secondaryColor });
    }
};

export const reducer = (state, action) => {
    state = state || initialState;
    if (action.type === requestType) {
        return {
            ...state,
            isLoading: true,
            dashboardSettings: currentDashboardSettings,
            error: false
        };
    }

    if (action.type === receiveDashboardSettingsType) {
        currentDashboardSettings = action.dashboardSettings;

        return {
            ...state,
            error: action.error,
            dashboardSettings: currentDashboardSettings,
            isLoading: false
        };
    }

    if (action.type === activeRouteMenu) {
        return {
            ...state,
            activeRouteMenu: action.activeRouteMenu,
        };
    }

    if (action.type === secondaryThemeColor) {
        return {
            ...state,
            secondaryThemeColor: action.secondaryThemeColor,
        };
    }

    return state;
};
