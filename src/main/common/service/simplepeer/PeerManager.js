import {MessageType, SystemEventType} from "../../types";
import appManager from "../AppManager";
import socketManager from "../SocketManager";
import Peer from "simple-peer";

class PeerManager {
  constructor() {
    this.userPeerMap = [];
  }

  destroyPeer = (id) => {
    let find = this.userPeerMap.find((item) => item.user.id === id);
    if (find) {
      find.peer.destroy();
    }
  };

  removeFromUserToPeerMap = (id) => {
    let find = this.userPeerMap.find((item) => item.user.userId === id);
    if (find) {
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

  updateBitRate = (sdp) => {
    var arr = sdp.split('\n');
    arr.forEach((str, i) => {
      if (/^a=fmtp:\d*/.test(str)) {
        arr[i] = str + ';x-google-max-bitrate=256;x-google-min-bitrate=0;x-google-start-bitrate=128';
      } else if (/^a=mid:(1|video)/.test(str)) {
        arr[i] += '\nb=AS:256';
      }
    });

    return arr.join('\n');
  };

  createPeer = (userToSignal, stream, audioMuted, videoMuted) => {
    let userDetails = appManager.getUserDetails();

    let opts = {
      initiator: true,
      trickle: false,
      streams: [stream.obj, stream.shareScreenObj],
      sdpTransform: (sdp) => this.updateBitRate(sdp),
      reconnectTimer: 5000,
      objectMode: false,
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
      socketManager.emitEvent(MessageType.SENDING_SIGNAL, {
        userToSignal,
        signallerUserId: userDetails.userId,
        signal,
        signallerName: userDetails.name,
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
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
      socketManager.emitEvent("callUser", {
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
      streams: [stream.obj, stream.shareScreenObj],
      sdpTransform: (sdp) => this.updateBitRate(sdp),
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
      socketManager.emitEvent(MessageType.RETURNING_SIGNAL, {
        signal,
        callerId: callerId,
        audioMuted: audioMuted,
        videoMuted: videoMuted
      });
    });

    return peer;
  };

  mapUserToPeer = (payload, stream, eventType, audioMuted, videoMuted) => {
    return new Promise((resolve, reject) => {
      let userPeerMapItem = this.userPeerMap.find((u) => u.user.userId === payload.userId);
      if (userPeerMapItem) {
        if (eventType === MessageType.USER_JOINED) {
          userPeerMapItem.peer.signal(payload.signal);
        }

        reject();
      } else {
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
          /*appManager.fireEvent(SystemEventType.PEER_DISCONNECT, {
            payload: payload
          });*/
        });

        peer.on("error", (err) => {
          console.log("PEER ERROR : ");
          console.log(err);
          console.log(JSON.stringify(err));
          if (err.code === 'ERR_CONNECTION_FAILURE') {
            appManager.fireEvent(SystemEventType.PEER_DISCONNECT, {
              payload: payload
            });

            console.log("PEER_DISCONNECT FIRED");
          }
        });

        this.userPeerMap.push(item);
        peer.on('stream', (stream) => {
          if (!item.mainStream) {
            console.log("MAIN STREAM AUDIO TRACK COUNT : " + stream.getAudioTracks().length);
            console.log(peer);
            item.mainStream = stream;
          } else {
            console.log("SHARE STREAM AUDIO TRACK COUNT : " + stream.getAudioTracks().length);
            console.log(peer);
            item.shareStream = stream;
          }

          if (item.mainStream && item.shareStream) {
            peer.removeAllListeners('stream');
            resolve(item);
          }
        });

        if (eventType === MessageType.USER_JOINED) {
          peer.signal(payload.signal);
        }
      }
    });
  };
}

const instance = new PeerManager();
Object.freeze(instance);
export default instance;
