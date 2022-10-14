import io from "socket.io-client";
import {MessageType} from "../types";
import Peer from "simple-peer";

class SocketManager {
  constructor() {
    if (!SocketManager.instance) {
      this.subscriptions = [];
      this.userPeerMap = [];
      SocketManager.instance = this;
      this.init();
    }

    return SocketManager.instance;
  }

  emitEvent = (eventType, data) => {
    this.socket.emit(eventType, data);
  };

  disconnectSocket = () => {
    this.socket.disconnect();
  };

  init = () => {
    //let currentUserSocket = io.connect('http://svn.agilemotion.co.za');
    let socket = io.connect('http://100.72.97.76:8000');

    for (const value of Object.keys(MessageType)) {
      socket.on(value, (payload) => {
        this.fireEvent(value, {socket: this.socket, payload: payload});
      });
    }

    this.socket = socket;
  };

  /**
   * Adds a subscription bound by the given event type.
   *
   * @param subscription the subscription to be added
   */
  addSubscription = (subscription) => this.subscriptions.push(subscription);

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

    if(filtered.length > 0) {
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

  refreshConnection = () => {
    this.socket.disconnect();
    this.init();
  };

  signal = (payload) => {
    const item = this.userPeerMap.find((p) => p.user.id === payload.id);
    console.log("\n\n\nITEM : ", item);
    item.peer.signal(payload.signal);
  };

  mapUserToPeer = (payload, stream, eventType) => {
    console.log("SUBS : ", this.subscriptions);
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
    this.clearAllEventListeners();

    this.emitEvent(MessageType.END_CALL, {callerID: this.socket.id});
  }
}

const instance = new SocketManager();
//Object.freeze(instance);

export default instance;
