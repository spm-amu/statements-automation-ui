import {MessageType} from "../../types";
import io from "socket.io-client";
import Peer from "simple-peer";

class SockerManager {

  constructor() {
    this.userPeerMap = [];
  }

  joinCurrentUserIn = (args, socket) => {
    console.log("\n\n\nINIT : ", args.stream);
    let stream = args.stream;
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    socket.emit(MessageType.JOIN_MEETING, {
      room: args.meetingId,
      userIdentity: userDetails.userId,
      name: userDetails.name,
      avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      email: userDetails.emailAddress,
      isHost: args.isHost
    });

    socket.on(MessageType.PERMIT, (payload) => {
      args.eventHandler.onAskForPermision(payload);
    });

    socket.on(MessageType.ALL_USERS, (users) => {
      this.userPeerMap.splice(0, this.userPeerMap.length);
      users.forEach((user) => {
        const peer = this.createPeer(user.id, socket.id, stream, socket);

        let item = {
          peer: peer,
          user: user,
        };

        this.userPeerMap.push(item);
      });

      args.eventHandler.onUsersArrived(this.userPeerMap);
    });

    socket.on(MessageType.USER_JOINED, (payload) => {
      const peer = this.addPeer(payload.signal, payload.callerID, stream, socket);
      let item = {
        peer: peer,
        user: payload,
      };

      this.userPeerMap.push(item);
      args.eventHandler.onUserJoin(item);
    });

    socket.on(
      MessageType.RECEIVING_RETURNED_SIGNAL,
      (payload) => {
        const item = this.userPeerMap.find((p) => p.user.id === payload.id);
        item.peer.signal(payload.signal);
      }
    );

    socket.on(MessageType.USER_LEFT, (payload) => {
      this.userPeerMap = this.userPeerMap.filter((item) => item.user.id !== payload.id);
      args.eventHandler.onUserLeave(payload);
    });

    args.eventHandler.onInit(socket);
  };

  addPeer(incomingSignal, callerID, stream, socket) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit(MessageType.RETURNING_SIGNAL, {
        signal,
        callerID,
      });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  createPeer = (userToSignal, callerID, stream, socket) => {
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit(MessageType.SENDING_SIGNAL, {
        userToSignal,
        callerID,
        signal,
        name: userDetails.name,
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
      });
    });

    return peer;
  };

  init = (args) => {
    let currentUserSocket = io.connect('http://svn.agilemotion.co.za');
    let userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    if (!args.isHost) {
      const userAlias = userDetails.userId;
      currentUserSocket.emit(MessageType.PERMISSION, {
        user: userAlias,
        room: args.meetingId,
        email: userDetails.emailAddress,
      });

      currentUserSocket.on(MessageType.NO_PERMIT_REQUIRED, () => {
        this.joinCurrentUserIn(args, currentUserSocket);
      });

      currentUserSocket.on(MessageType.ALLOWED, () => {
        this.joinCurrentUserIn(args, currentUserSocket);
      });

      currentUserSocket.on(MessageType.DENIED, () => {
      });
    } else {
      this.joinCurrentUserIn(args, currentUserSocket);
    }
  }
}

export const instance = new SockerManager();
