import io from "socket.io-client";
import {MessageType, SystemEventType} from "../types";
import Peer from "simple-peer";
import appManager from "./AppManager";

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.subscriptions = [];
      this.usersOnline = [];
      this.unreadMessages = [];
      this.chatEvents = [];
      SocketManager.instance = this;
    }

    return SocketManager.instance;
  }

  emitEvent = (eventType, data) => {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        let response = this.socket.emit(eventType, data, (data) => {
          if (data.status === 'SUCCESS') {
            resolve(data);
          } else {
            console.error("ERROR EMITTING EVENT : " + eventType);
            reject(new Error(data.status));
          }
        });

        if (!response.connected) {
          reject(new Error("CONNECTION_ERROR"));
        }
      } else {
        reject(new Error("CONNECTION_ERROR"));
      }
    });
  };

  disconnectSocket = () => {
    if (this.socket) {
      this.socket.disconnect();
    }
  };

  isUserOnline = (user) => {
    for (const usersOnlineElement of this.usersOnline) {
      if (usersOnlineElement.userId === user.userId) {
        return true;
      }
    }

    return false;
  };

  init = () => {
    let socket = io.connect(appManager.getSignalingServerHost());
    let userDetails = appManager.getUserDetails();

    for (const value of Object.keys(MessageType)) {
      socket.on(value, (payload) => {
        if (value !== MessageType.USERS_ONLINE
          && value !== MessageType.USER_ONLINE && value !== MessageType.USER_OFFLINE) {
          console.log('EVENT: ', value);
          console.log(this.subscriptions);
          this.fireEvent(value, {socket: this.socket, payload: payload});
        }
      });
    }

    socket.on("connect", () => {
      this.emitEvent(MessageType.REGISTER_ONLINE, {id: userDetails.userId, name: userDetails.name}).then((data) => {
        appManager.fireEvent(SystemEventType.SOCKET_CONNECT, {});
      }).catch((exp) => {
        console.log(exp.message);
      });
    });

    socket.on('disconnect', function () {
      appManager.fireEvent(SystemEventType.SOCKET_DISCONNECT, {});
    });

    socket.on(MessageType.USERS_ONLINE, (payload) => {
      this.usersOnline.splice(0, this.usersOnline.length);
      for (const payloadElement of payload) {
        this.usersOnline.push(payloadElement);
      }

      this.fireEvent(MessageType.USERS_ONLINE, {socket: this.socket, payload: payload});
    });

    socket.on(MessageType.USER_ONLINE, (payload) => {
      this.usersOnline.push(payload);
      this.fireEvent(MessageType.USER_ONLINE, {socket: this.socket, payload: payload});
    });

    socket.on(MessageType.USER_OFFLINE, (payload) => {
      for (let i = 0; i < this.usersOnline.length; i++) {
        console.log(this.usersOnline[i].userId + " === " + payload.userId);
        if (this.usersOnline[i].userId === payload.userId) {
          this.usersOnline.splice(i, 1);
        }
      }

      this.fireEvent(MessageType.USER_OFFLINE, {socket: this.socket, payload: payload});
    });

    this.socket = socket;
  };

  /**
   * Adds a subscription bound by the given event type.
   *
   * @param handler the subscription to be added
   * @param eventTypes the subscription to be added
   */
  addSubscriptions = (handler, ...eventTypes) => {
    for (const eventType of eventTypes) {
      this.subscriptions.push({
        handler,
        eventType
      });
    }
  };

  /**
   * Fires an event.
   *
   * @param eventType eventType the event type
   * @param be the base event
   * @return false if any subscriptions cancel the event.
   */
  async fireEvent(eventType, be) {
    for (const subscription of this.subscriptions) {
      if (subscription.eventType === eventType) {
        subscription.handler.api.on(eventType, be);
      }
    }
  }

  removeSubscriptions = (handler) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.handler.api.id !== handler.api.id);
  };

  /**
   * Clears all event subscriptions
   *
   */
  clearAllEventListeners() {
    this.subscriptions.splice(0, this.subscriptions.length);
  };

  endCall = (isDirect = false, caller = null, roomId) => {
    if (this.socket) {
      this.emitEvent(MessageType.END_CALL, {
        callerUserId: appManager.getUserDetails().userId,
        callerID: isDirect && caller ? caller.socketId : this.socket.id,
        direct: isDirect,
        roomID: roomId
      }).catch((error) => {
      });
    }
  };

  declineDirectCall = (callerSocketId, callRoom, reason) => {
    this.emitEvent(MessageType.END_CALL,
      {
        callerUserId: appManager.getUserDetails().userId,
        callerID: callerSocketId,
        roomID: callRoom,
        direct: true,
        reject: true,
        reason: reason
      }).catch((error) => {
    });
  }
}

const instance = new SocketManager();
//Object.freeze(instance);

export default instance;
