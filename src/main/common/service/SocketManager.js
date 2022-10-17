import io from "socket.io-client";
import {MessageType} from "../types";
import Peer from "simple-peer";

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.subscriptions = [];
      this.userPeerMap = [];
      this.usersOnline = [];
      SocketManager.instance = this;
    }

    return SocketManager.instance;
  }

  emitEvent = (eventType, data) => {
    this.socket.emit(eventType, data);
  };

  disconnectSocket = () => {
    if(this.socket) {
      this.socket.disconnect();
    }
  };

  isUserOnline = (user) => {
    for (const usersOnlineElement of this.usersOnline) {
      if(usersOnlineElement.userId === user.userId) {
        return true;
      }
    }

    return false;
  };

  init = () => {
    //let currentUserSocket = io.connect('http://svn.agilemotion.co.za');
    let socket = io.connect('http://100.72.122.19:8000');
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    for (const value of Object.keys(MessageType)) {
      socket.on(value, (payload) => {
        if (value !== MessageType.USERS_ONLINE
          || value !== MessageType.USER_ONLINE || value !== MessageType.USER_OFFLINE) {
          this.fireEvent(value, {socket: this.socket, payload: payload});
        }
      });
    }

    socket.on("connect", () => {
      socket.emit(MessageType.REGISTER_ONLINE, {id: userDetails.userId});
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
        if(this.usersOnline[i].userId === payload.userId) {
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
        subscription.handler.on(eventType, be);
      }
    }
  }

  removeSubscriptions = (handler) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.handler.id !== handler.id);
  };

  /**
   * Clears all event subscriptions
   *
   */
  clearAllEventListeners() {
    this.subscriptions.splice(0, this.subscriptions.length);
  };

  createPeer = (userToSignal, stream) => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.SENDING_SIGNAL, {
        userToSignal,
        callerID: this.socket.id,
        signal,
        name: userDetails.name,
        avatar: require('../../desktop/dashboard/images/noimage-person.png'),
      });
    });

    return peer;
  };

  callUser = (userToSignal, stream) => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

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
      });
    });

    return  peer;
  };

  addPeer(callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      this.socket.emit(MessageType.RETURNING_SIGNAL, {
        signal,
        callerID: callerId,
      });
    });

    return peer;
  };

  destroyPeer = (id) => {
    let filtered = this.userPeerMap.filter((item) => item.user.id === id);

    if (filtered.length > 0) {
      for (const filteredElement of filtered) {
        let peerObj = filteredElement.peer;
        if (peerObj) {
          peerObj.destroy();
        }
      }
    }
  };

  removeFromUserToPeerMap = (id) => {
    this.destroyPeer(id);
    let filtered = this.userPeerMap.filter((item) => item.user.id !== id);
    this.userPeerMap.splice(0, this.userPeerMap.length);

    for (const filteredElement of filtered) {
      this.userPeerMap.push(filteredElement);
    }
  };

  clearUserToPeerMap = () => {
    for (const userPeerMapElement of this.userPeerMap) {
      this.destroyPeer(userPeerMapElement.user.id);
    }

    this.userPeerMap.splice(0, this.userPeerMap.length);
  };

  signal = (payload) => {
    const item = this.userPeerMap.find((p) => p.user.id === payload.id);
    item.peer.signal(payload.signal);
  };

  mapUserToPeer = (payload, stream, eventType) => {
    const peer = eventType === MessageType.ALL_USERS ? this.createPeer(payload.id, stream) :
      this.addPeer(payload.callerID, stream);

    let item = {
      peer: peer,
      user: payload,
    };

    this.userPeerMap.push(item);
    return item;
  };

  endCall = () => {
    this.disconnectSocket();
    this.init();
    this.emitEvent(MessageType.END_CALL, {callerID: this.socket.id});
  };

  endDirectCall = (callerSocketId) => {
    this.emitEvent(MessageType.END_CALL, {callerID: callerSocketId});
  }
}

const instance = new SocketManager();
//Object.freeze(instance);

export default instance;
