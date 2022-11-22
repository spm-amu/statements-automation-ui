import Utils from "../Utils"
import {get} from "../service/RestService";

const MINUTE = 60000;
export const ACCESS_TOKEN_PROPERTY = "accessToken";
export const LAST_LOGIN = "lastLogin";
const ID_TOKEN_PROPERTY = "idToken";
export const REFRESH_TOKEN_PROPERTY = "refreshToken";

class TokenManager {

    startTokenRefreshMonitor(url, username) {
        setInterval(function () {
            let lastLogin = Utils.getSessionValue(LAST_LOGIN);
            let refreshToken = Utils.getSessionValue(REFRESH_TOKEN_PROPERTY);

            if (!Utils.isNull(lastLogin) && !Utils.isNull(refreshToken)) {
                let diff = ((new Date().getTime() - parseFloat(lastLogin)) / MINUTE);
                if (diff >= 57) {
                    console.log("Refreshing Token AT [" + diff + "]");

                    if(refreshToken) {
                      let refreshUrl = `${url}?refreshToken=${refreshToken}`;
                      get(refreshUrl, (response) => {
                          // TODO : Set expiry date for desktop app in line with the user's AD password change. DO NOT SET expiry date for web all so that the cookie dies with the browser
                          Utils.setSessionValue(ACCESS_TOKEN_PROPERTY, response.access_token);
                          Utils.setSessionValue(REFRESH_TOKEN_PROPERTY, response.refresh_token);
                          Utils.setSessionValue(LAST_LOGIN, new Date().getTime());
                        },
                        (e) => {
                          console.error('Error refreshing token');
                        }, null, false)
                    }
                }
            }
        }, MINUTE);
    }
}

const instance = new TokenManager();
Object.freeze(instance);

export default instance;
