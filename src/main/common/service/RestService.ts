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
  doFetch(url: string, successCallback: any, errorCallback: any, body: any, method: string, track: boolean = true, secure: boolean = true) {
    const accessToken = Utils.getCookie("accessToken");

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
        this.executeFetch(url, fetchConfig, successCallback, errorCallback)
      );
    } else {
      this.executeFetch(url, fetchConfig, successCallback, errorCallback);
    }
  }

  executeFetch(url: string, fetchConfig: any, successCallback: any, errorCallback: any) {
    return fetch(encodeURI(url), fetchConfig)
      .then(status)
      .then(json)
      .then((data) => {
        successCallback(JSON.parse(data));
      }).catch((e) => {
        console.error(e);
        if (e.status === 401 && !url.endsWith("/logout")) {
          errorCallback(e);
          appManager.fireEvent(SystemEventType.UNAUTHORISED_API_CALL, null);
        }

        if (errorCallback !== null) {
          errorCallback(e);
        }
      });
  }
}

const rest = new RestService();
export const post = (url: string, successCallback: any, errorCallback: any, body: any, track: boolean = true, secure: boolean = true) => {
  return rest.doFetch(url, successCallback, errorCallback, body, 'POST', track, secure);
};

export const get = (url: string, successCallback: any, errorCallback: any, track: boolean = true, secure: boolean = true) => {
  return rest.doFetch(url, successCallback, errorCallback, null, 'GET', track, secure);
};
