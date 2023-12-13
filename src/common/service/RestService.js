import {trackPromise} from 'react-promise-tracker';
import Utils from "../Utils";
import appManager from "../../common/service/AppManager";

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
    let data = body ? JSON.stringify(body) : null;
    let fetchConfig = {
      method: !Utils.isNull(method) ? method : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: data
    };

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
        if(data && data.length > 0) {
          successCallback(JSON.parse(data));
        } else {
          successCallback();
        }
      }).catch((e) => {
        console.error(e);
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
