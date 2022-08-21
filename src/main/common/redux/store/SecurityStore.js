const requestType = 'REQUEST';
const receiveUserDetailsType = 'RECEIVE_USER_DETAILS';

const initialState = {
    userDetails: {}, isLoading: false, error: false, currentMenuJson: ""
};

let currentUserDetails = {};

export const actionCreators = {
    login: (url, username, password) => async (dispatch) => {
        dispatch({ type: requestType });
        const response = await fetch(url);
        const userDetails = await response.json();
        dispatch({ type: receiveUserDetailsType, userDetails });
    }
};

export const reducer = (state, action) => {
    state = state || initialState;
    if (action.type === requestType) {
        return {
            ...state,
            isLoading: true,
            error: false,
            userDetails: {}
        };
    }

    if (action.type === receiveUserDetailsType) {
        currentUserDetails = JSON.parse(action.userDetails);
        return {
            ...state,
            userDetails: currentUserDetails,
            isLoading: false
        };
    }

    return state;
};
