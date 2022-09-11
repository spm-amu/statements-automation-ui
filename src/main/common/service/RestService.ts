import {trackPromise} from 'react-promise-tracker';
import Utils from "../Utils";

export const host = window.location.protocol + "//" + window.location.hostname + "/vc";
const status = (response: any) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    let error = new Error(response.statusText);
    return Promise.reject(error);
  }
};

const json = (response: any) => {
  return response.text();
};

class RestService {
  fetchWithCustomConfig(url: string, successCallback: any, errorCallback: any, body: any, method: string, track: boolean = true) {
    //const accessToken = sessionStorage.getItem("accessToken");
    //const idToken = sessionStorage.getItem("idToken");

    let data = body ? JSON.stringify(body) : null;
    let fetchConfig = {
      method: !Utils.isNull(method) ? method : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        //'Authorization': 'Bearer ' + accessToken,
        //'idToken': idToken

      },
      body: data
    };

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
        if (e.code === 401 && !url.endsWith("/logout")) {
          errorCallback(e);
          // TODO : Navigate to login screen
        }

        if (errorCallback !== null) {
          errorCallback(e);
        }
      });
  }
}

const rest = new RestService();
export const post = (url: string, successCallback: any, errorCallback: any, body: any, track: boolean = true) => {
  return rest.fetchWithCustomConfig(url, successCallback, errorCallback, body, 'POST', track);
};

export const get = (url: string, successCallback: any, errorCallback: any, track: boolean = true) => {
  return rest.fetchWithCustomConfig(url, successCallback, errorCallback, null, 'GET', track);
};
