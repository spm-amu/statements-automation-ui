import Utils from "../Utils"
import {get} from "../service/RestService";

const MINUTE = 60000;
const ACCESS_TOKEN_PROPERTY = "accessToken";
const LAST_LOGIN = "lastLogin";
const ID_TOKEN_PROPERTY = "idToken";
const REFRESH_TOKEN_PROPERTY = "refreshToken";

class TokenManager {

    startTokenRefreshMonitor(url, username) {
        setInterval(function () {
            let lastLogin = Utils.getCookie(LAST_LOGIN);
            let refreshToken = Utils.getCookie(REFRESH_TOKEN_PROPERTY);

            if (!Utils.isNull(lastLogin) && !Utils.isNull(refreshToken)) {
                let diff = ((new Date().getTime() - parseFloat(lastLogin)) / MINUTE);
                if (diff >= 57) {
                    console.log("Refreshing Token AT [" + diff + "]");
                    let refreshUrl = `${url}?refreshToken=${refreshToken}&username=${username}`;
                    get(refreshUrl, (response) => {
                        // TODO : Set expiry date for desktop app in line with the user's AD password change. DO NOT SET expiry date for web all so that the cookie dies with the browser
                        Utils.setCookie(ACCESS_TOKEN_PROPERTY, response.access_token, 30);
                        Utils.setCookie(REFRESH_TOKEN_PROPERTY, response.refresh_token, 30);
                        Utils.setCookie(LAST_LOGIN, new Date().getTime(), 30);
                      },
                        (e) => {
                            console.error('Error refreshing token');
                        }, false)
                }
            }
        }, MINUTE);
    }
}

const instance = new TokenManager();
Object.freeze(instance);

export default instance;
