import io from "socket.io-client";
import {MessageType} from "../types";
import Peer from "simple-peer";
import appManager from "./AppManager";

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.subscriptions = [];
      this.userPeerMap = [];
      this.usersOnline = [];
      this.chatEvents = [];
      SocketManager.instance = this;
    }

    return SocketManager.instance;
  }

  emitEvent = (eventType, data) => {
    if (this.socket) {
      this.socket.emit(eventType, data);
    }
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
      socket.emit(MessageType.REGISTER_ONLINE, {id: userDetails.userId, name: userDetails.name});
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

    const peer = new Peer({
      initiator: true,
      trickle: false,
      streams: [stream.obj, stream.shareScreenObj],
      config: appManager.isOnline() ?
        {
          iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'}]
        }
        :
        {
        iceServers: []
      }
    });

    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.SENDING_SIGNAL, {
        userToSignal,
        callerId: userDetails.userId,
        signal,
        name: userDetails.name,
        avatar: require('../../desktop/dashboard/images/noimage-person.png'),
        audioMuted: audioMuted,
        videoMuted: videoMuted,
        mainStreamId: stream.obj.id,
        shareStreamId: stream.shareScreenObj.id
      });
    });

    peer.on('close', () => {
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
    const peer = new Peer({
      initiator: false,
      trickle: false,
      streams: [stream.obj, stream.shareScreenObj],
      config: appManager.isOnline() ?
        {
          iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'}]
        }
        :
        {
          iceServers: []
        }
    });

    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.RETURNING_SIGNAL, {
        signal,
        callerId: callerId,
        audioMuted: audioMuted,
        videoMuted: videoMuted,
        mainStreamId: stream.obj.id,
        shareStreamId: stream.shareScreenObj.id
      });
    });

    peer.on('close', () => {
    });

    return peer;
  };

  destroyPeer = (id) => {
    let filtered = this.userPeerMap.filter((item) => item.user.id === id);

    if (filtered.length > 0) {
      for (const filteredElement of filtered) {
        let peerObj = filteredElement.peer;
        if (peerObj && peerObj.connected) {
          peerObj.destroy();
        }
      }
    }
  };

  removeFromUserToPeerMap = (id) => {
    //this.destroyPeer(id);
    let filtered = this.userPeerMap.filter((item) => item.user.id !== id);
    this.userPeerMap.splice(0, this.userPeerMap.length);

    for (const filteredElement of filtered) {
      this.userPeerMap.push(filteredElement);
    }
  };

  clearUserToPeerMap = () => {
    for (const userPeerMapElement of this.userPeerMap) {
      //this.destroyPeer(userPeerMapElement.user.id);
    }

    this.userPeerMap.splice(0, this.userPeerMap.length);
  };

  signal = (payload) => {
    const item = this.userPeerMap.find((p) => p.user.id === payload.id);
    item.peer.signal(payload.signal);
  };

  mapUserToPeer = (payload, stream, eventType, audioMuted, videoMuted) => {
    const peer = eventType === MessageType.ALL_USERS ? this.createPeer(payload.userId, stream, audioMuted, videoMuted) :
      this.addPeer(payload.userId, stream, audioMuted, videoMuted);

    let item = {
      peer: peer,
      user: payload
    };

    this.userPeerMap.push(item);
    let promise = new Promise((resolve, reject) => {
      peer.on('stream', (stream) => {
        if (stream.id === payload.mainStreamId) {
          item.mainStream = stream;
        } else if (stream.id === payload.shareStreamId) {
          item.shareStream = stream;
        }

        if(item.mainStream && item.shareStream) {
          resolve(item);
        }
      });
    });

    if(eventType === MessageType.USER_JOINED) {
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
      });
    }
  };

  declineDirectCall = (callerSocketId, callRoom, reason) => {
    this.emitEvent(MessageType.END_CALL, {callerID: callerSocketId, roomID: callRoom, direct: true, reject: true, reason: reason});
  }
}

const instance = new SocketManager();
//Object.freeze(instance);

export default instance;
