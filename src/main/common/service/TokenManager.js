import Utils from "../Utils"
import {get} from "../service/RestService";
import appManager from "./AppManager";

const MINUTE = 60000;
export const ACCESS_TOKEN_PROPERTY = "accessToken";
export const LAST_LOGIN = "lastLogin";
const ID_TOKEN_PROPERTY = "idToken";
export const REFRESH_TOKEN_PROPERTY = "refreshToken";

const {electron} = window;

class TokenManager {

  startTokenRefreshMonitor(url, username) {
    console.log("STARTING TOKEN MONITOR");
    this.interval = setInterval(function () {
      let lastLogin = appManager.get(LAST_LOGIN);
      let refreshToken = appManager.get(REFRESH_TOKEN_PROPERTY);

      if (!Utils.isNull(lastLogin) && !Utils.isNull(refreshToken)) {
        let diff = ((new Date().getTime() - parseFloat(lastLogin)) / MINUTE);
        if (diff >= 57) {
          if (refreshToken) {
            let refreshUrl = `${url}?refreshToken=${refreshToken}`;
            get(refreshUrl, (response) => {
                let lastLogin = new Date().getTime();
                console.log("REFRESHED SUCCESSFULLY AT : " + diff);
                electron.ipcRenderer.sendMessage('saveTokens', {
                  accessToken: response.access_token,
                  refreshToken: response.refresh_token,
                  lastLogin: lastLogin
                });

                appManager.add(ACCESS_TOKEN_PROPERTY, response.access_token);
                appManager.add(REFRESH_TOKEN_PROPERTY, response.refresh_token);
                appManager.add(LAST_LOGIN, lastLogin);
              },
              (e) => {
                console.error('Error refreshing token');
              }, null, false, false)
          }
        }
      }
    }, MINUTE);
  }

  stopTokenRefreshMonitor() {
    console.log("CLEARING INTERVAL");
    clearInterval(this.interval);
  }
}

const instance = new TokenManager();
//Object.freeze(instance);

export default instance;
