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
    if(this.socket) {
      this.socket.emit(eventType, data);
    }
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
    let socket = io.connect('http://svn.agilemotion.co.za');
    // let socket = io.connect('http://100.72.207.105:8000');
    let userDetails = appManager.getUserDetails();

    for (const value of Object.keys(MessageType)) {
      socket.on(value, (payload) => {
        if (value !== MessageType.USERS_ONLINE
          && value !== MessageType.USER_ONLINE && value !== MessageType.USER_OFFLINE && value !== MessageType.CHAT_MESSAGE) {
          console.log('EVENT: ', value);
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

    socket.on(MessageType.CHAT_MESSAGE, (payload) => {
      const chatEvent = this.chatEvents.find(e => e.id === payload.roomId);
      chatEvent.messages.push(payload.message);
      chatEvent.updatedDate = new Date();

      console.log('FIRE EVENT::: ', payload);
      this.fireEvent(MessageType.CHAT_MESSAGE, {socket: this.socket, payload: payload});
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

  createPeer = (userToSignal, stream) => {
    let userDetails = appManager.getUserDetails();

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
        userAlias: userDetails.userId,
        avatar: require('../../desktop/dashboard/images/noimage-person.png'),
        audioMuted: !stream.getTracks()[1].enabled,
        videoMuted: !stream.getTracks()[0].enabled
      });
    });

    peer.on('close', () => {
      alert("PEER CLOSED");
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
        audioMuted: !stream.getTracks()[1].enabled,
        videoMuted: !stream.getTracks()[0].enabled
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
    this.destroyPeer(id);
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

  mapUserToPeer = (payload, stream, eventType) => {
    const peer = eventType === MessageType.ALL_USERS ? this.createPeer(payload.id, stream) :
      this.addPeer(payload.callerID, stream);

    let item = {
      peer: peer,
      user: payload
    };

    this.userPeerMap.push(item);
    return item;
  };

  endCall = () => {
    if(this.socket) {
      this.emitEvent(MessageType.END_CALL, {callerID: this.socket.id});
    }
  };

  endDirectCall = (callerSocketId) => {
    this.emitEvent(MessageType.END_CALL, {callerID: callerSocketId});
  }
}

const instance = new SocketManager();
//Object.freeze(instance);

export default instance;
