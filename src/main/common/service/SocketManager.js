import io from "socket.io-client";
import {MessageType, SystemEventType} from "../types";
import Peer from "simple-peer";
import appManager from "./AppManager";

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.subscriptions = [];
      this.userPeerMap = [];
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

  createPeer = (userToSignal, stream, audioMuted, videoMuted) => {
    let userDetails = appManager.getUserDetails();

    let opts = {
      initiator: true,
      trickle: false,
      streams: [stream.obj, stream.shareScreenObj]
    };

    if (!appManager.isOnline()) {
      opts.config = {
        iceServers: []
      }
    }

    console.log("CREATING PEER WITH OPTS : ", opts);
    console.log("IS NET-0? " + !appManager.isOnline());

    const peer = new Peer(opts);

    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.SENDING_SIGNAL, {
        userToSignal,
        signallerUserId: userDetails.userId,
        signal,
        signallerName: userDetails.name,
        avatar: require('../../desktop/dashboard/images/noimage-person.png'),
        audioMuted: audioMuted,
        videoMuted: videoMuted
      });
    });

    return peer;
  };

  callUser = (userToSignal, stream) => {
    let userDetails = appManager.getUserDetails();

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on("signal", (signal) => {
      this.socket.emit("callUser", {
        userToCall: userToSignal,
        signalData: signal,
        callerId: this.socket.id,
        name: userDetails.name,
        audioMuted: !stream.getTracks()[1].enabled,
        videoMuted: !stream.getTracks()[0].enabled
      });
    });

    return peer;
  };

  addPeer(callerId, stream, audioMuted, videoMuted) {
    let opts = {
      initiator: false,
      trickle: false,
      streams: [stream.obj, stream.shareScreenObj]
    };

    if (!appManager.isOnline()) {
      opts.config = {
        iceServers: []
      }
    }

    console.log("ADDING PEER WITH OPTS : ", opts);
    console.log("IS NET-0? " + !appManager.isOnline());

    const peer = new Peer(opts);
    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.RETURNING_SIGNAL, {
        signal,
        callerId: callerId,
        audioMuted: audioMuted,
        videoMuted: videoMuted
      });
    });

    return peer;
  };

  destroyPeer = (id) => {
    let find = this.userPeerMap.find((item) => item.user.id === id);
    if (find) {
      find.peer.destroy();
    }
  };

  // TODO : Change this method to take userId
  removeFromUserToPeerMap = (id) => {
    let find = this.userPeerMap.find((item) => item.user.userId === id);
    console.log("REMOVING : " + id);
    if(find) {
      this.destroyPeer(id);
      let filtered = this.userPeerMap.filter((item) => item.user.userId !== id);
      this.userPeerMap.splice(0, this.userPeerMap.length);

      for (const filteredElement of filtered) {
        this.userPeerMap.push(filteredElement);
      }
    }
  };

  clearUserToPeerMap = () => {
    for (const userPeerMapElement of this.userPeerMap) {
      this.destroyPeer(userPeerMapElement.user.userId);
    }

    this.userPeerMap.splice(0, this.userPeerMap.length);
  };

  signal = (payload) => {
    const item = this.userPeerMap.find((p) => p.user.socketId === payload.socketId);
    item.peer.signal(payload.signal);
  };

  mapUserToPeer = (payload, stream, eventType, audioMuted, videoMuted) => {
    const peer = eventType === MessageType.ALL_USERS ? this.createPeer(payload.userId, stream, audioMuted, videoMuted) :
      this.addPeer(payload.userId, stream, audioMuted, videoMuted);

    let itemUser = JSON.parse(JSON.stringify(payload));
    let item = {
      peer: peer,
      user: payload
    };

    peer.on('close', () => {
      console.log("PEER CLOSE : ");
      console.log(payload);
      appManager.fireEvent(SystemEventType.PEER_DISCONNECT, {
        payload: payload
      });
    });

    peer.on("error", (err) => {
      console.log("PEER ERROR : ");
      console.log(err);
      console.log(JSON.stringify(err));
      if(err.code === 'ERR_CONNECTION_FAILURE') {
        appManager.fireEvent(SystemEventType.PEER_DISCONNECT, {
          payload: payload
        });

        console.log("PEER_DISCONNECT FIRED");
      }
    });

    this.userPeerMap.push(item);
    let promise = new Promise((resolve, reject) => {
      peer.on('stream', (stream) => {
        if (!item.mainStream) {
          console.log("\n\n\n\nMAIN STREAM AUDIO TRACK COUNT : " + stream.getAudioTracks().length);
          console.log(peer);
          item.mainStream = stream;
        } else {
          console.log("\n\n\n\nSHARE STREAM AUDIO TRACK COUNT : " + stream.getAudioTracks().length);
          console.log(peer);
          item.shareStream = stream;
        }

        if (item.mainStream && item.shareStream) {
          resolve(item);
        }
      });
    });

    if (eventType === MessageType.USER_JOINED) {
      peer.signal(payload.signal);
    }

    return promise;
  };

  endCall = (isDirect = false, caller = null, roomId) => {
    if (this.socket) {
      this.emitEvent(MessageType.END_CALL, {
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
