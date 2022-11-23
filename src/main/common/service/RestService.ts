import {trackPromise} from 'react-promise-tracker';
import Utils from "../Utils";
import appManager from "../../common/service/AppManager";
import {SystemEventType} from "../types";

// export const host = window.location.protocol + "//" + window.location.hostname + "/vc";
//export const host = "http://svn.agilemotion.co.za/vc";
export const host = "http://localhost:8082/vc";
const status = (response: any) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(response);
  }
};

const json = (response: any) => {
  return response.text();
};

class RestService {
  doFetch(url: string, successCallback: any, errorCallback: any, body: any, method: string, successMessage: string, track: boolean = true, secure: boolean = true) {
    const accessToken = Utils.getSessionValue("accessToken");

    let data = body ? JSON.stringify(body) : null;
    let fetchConfig = {
      method: !Utils.isNull(method) ? method : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: data
    };


    if(secure) {
      // @ts-ignore
      fetchConfig.headers['Authorization'] = 'Bearer ' + accessToken;
    }

    if (track) {
      trackPromise(
        this.executeFetch(url, fetchConfig, successMessage, successCallback, errorCallback)
      );
    } else {
      this.executeFetch(url, fetchConfig, successMessage, successCallback, errorCallback);
    }
  }

  executeFetch(url: string, fetchConfig: any, successMessage: string, successCallback: any, errorCallback: any, reAttempting: boolean = false) {
    return fetch(encodeURI(url), fetchConfig)
      .then(status)
      .then(json)
      .then((data) => {
        successCallback(JSON.parse(data));
        appManager.fireEvent(SystemEventType.API_SUCCESS, {message: successMessage});
      }).catch((e) => {
        console.error(e);

        if (e.status === 401 && !url.endsWith("/logout") && !url.endsWith("/userInfo") && !url.includes("/refresh?refreshToken=")) {
          const refreshToken = Utils.getSessionValue("refreshToken");

          if(!reAttempting) {
            console.log("REFRESHING AND RE-ATTEMPTING");
            let refreshFetchConfig = {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            };

            fetch(encodeURI(`${host}/api/v1/auth/refresh?refreshToken=${refreshToken}`), refreshFetchConfig)
              .then(status)
              .then(json)
              .then((data) => {
                appManager.fireEvent(SystemEventType.SECURITY_TOKENS_REFRESHED, data);
                fetchConfig.headers['Authorization'] = 'Bearer ' + data.access_token;

                this.executeFetch(url, fetchConfig, successMessage, successCallback, errorCallback, true);
              }).catch(() => {
              appManager.fireEvent(SystemEventType.UNAUTHORISED_API_CALL, null);
            });
          } else {
            appManager.fireEvent(SystemEventType.UNAUTHORISED_API_CALL, null);
          }
        } else {
          e.json().then((error: any) => {
            appManager.fireEvent(SystemEventType.API_ERROR, error);
          });
        }

        if (errorCallback) {
          errorCallback(e);
        }
      });
  }
}

const rest = new RestService();
export const post = (url: string, successCallback: any, errorCallback: any, body: any, successMessage: string = '', track: boolean = true, secure: boolean = true) => {
  return rest.doFetch(url, successCallback, errorCallback, body, 'POST', successMessage, track, secure);
};

export const get = (url: string, successCallback: any, errorCallback: any, successMessage: string = '', track: boolean = true, secure: boolean = true) => {
  return rest.doFetch(url, successCallback, errorCallback, null, 'GET', successMessage, track, secure);
};
