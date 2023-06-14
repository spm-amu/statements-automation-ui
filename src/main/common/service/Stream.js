import {osName} from "react-device-detect";

export class Stream {
  constructor() {
  }

  init = async (video = true, audio = true, successHandler, errorhandler, retry = false,
                socketManager) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: retry ? false : {
          width: {min: 160, ideal: 320, max: 640},
          height: {min: 120, ideal: 240, max: 480},
        }
      });

    userMedia
      .then((stream) => {
        stream.getAudioTracks()[0].enabled = audio;
        this.obj = stream;
        if (!video && stream.getVideoTracks().length > 0) {
          stream.getVideoTracks()[0].enabled = false;
          //stream.getVideoTracks()[0].stop();
        }

        navigator.mediaDevices.ondevicechange = () => {
          console.log("MEDIA CHANGED");
          console.log("UPDATING TRACKS");

          let newUserMedia = navigator.mediaDevices
            .getUserMedia({
              audio: true,
              video: false
            });

          newUserMedia
            .then((stream) => {
                let newAudioTrack = stream.getAudioTracks()[0];
                if (this.getAudioTracks().length > 0 && this.getAudioTracks()[0]) {
                  this.replacePeerAudioTracks(socketManager, newAudioTrack);
                  this.obj.removeTrack(this.getAudioTracks()[0]);
                }

                this.obj.addTrack(newAudioTrack);
              }
            );
        };

        if (successHandler) {
          successHandler(this.obj, this.shareScreenObj, stream.getVideoTracks().length === 0);
        }
      }).catch((e) => {
      if (!retry) {
        this.init(false, audio, successHandler, errorhandler, true, socketManager);
      } else {
        console.log("STREAM FAILED");
        console.log(e);
        if (errorhandler) {
          errorhandler(e);
        }
      }
    });
  };

  createScreenShareStream = (socketManager, source) => {
    const videoConstraints = {
      cursor: true,
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    };

    if (osName === 'Mac OS') {
      videoConstraints.audio = false;
    }

    navigator.mediaDevices
      .getUserMedia(videoConstraints)
      .then((stream) => {
        console.log("ADDING SHARE SCREEN STREAM");
        this.shareScreenObj = stream;
        socketManager.userPeerMap.forEach((peerObj) => {
          peerObj.peer.addStream(stream);
        });
      })
      .catch(e => {
        console.log(e)
      });
  };

  closeScreenStream = (socketManager) => {
    if(this.shareScreenObj) {
      this.closeObj(this.shareScreenObj);
      console.log("REMOVING SHARE SCREEN STREAM");
      socketManager.userPeerMap.forEach((peerObj) => {
        try {
          peerObj.peer.removeStream(this.shareScreenObj);
        } catch(e) {
          console.log("Share stream does not exist for : " + peerObj.user.userId);
        }
      });
    }
  };

  async replacePeerAudioTracks(socketManager, newAudioTrack) {
    if (socketManager) {
      console.log("REPLACING PEER TRACKS");
      socketManager.userPeerMap.forEach((peerObj) => {
        this.replacePeerAudioTrack(peerObj, newAudioTrack);
      });
    }
  }

  async replacePeerAudioTrack(peerObj, newAudioTrack) {
    if (peerObj.peer.connected) {
      try {
        peerObj.peer.replaceTrack(
          this.getAudioTracks()[0],
          newAudioTrack,
          this.obj
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  closeObj = (obj) => {
    if (obj) {
      obj.getTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop();
          this.removeTrack(track);
        });
    }
  };

  close = () => {
    this.closeObj(this.obj);
    this.closeObj(this.shareScreenObj);
  };

  addTrack = (track) => {
    this.obj.addTrack(track);
  };

  removeTrack = (track) => {
    this.obj.removeTrack(track);
  };

  getVideoTracks = () => {
    if (!this.obj) {
      return [];
    }

    return this.obj.getVideoTracks();
  };

  getAudioTracks = () => {
    return this.obj.getAudioTracks();
  };

  getTracks = () => {
    return this.obj.getTracks();
  };

  enableVideo = (enabled, socketManager) => {
    if (enabled) {
      let userMedia = navigator.mediaDevices
        .getUserMedia(
          {
            audio: true,
            video: {
              width: {min: 160, ideal: 320, max: 640},
              height: {min: 120, ideal: 240, max: 480},
            }
          });
      userMedia
        .then((stream) => {
          this.videoTrack = stream.getVideoTracks()[0];
          if (this.getVideoTracks().length > 0 && this.getVideoTracks()[0]) {
            if (socketManager) {
              this.replacePeerVideoTracks(socketManager);
            }

            this.getVideoTracks()[0].stop();
            this.obj.removeTrack(this.getVideoTracks()[0]);
          }

          this.obj.addTrack(this.videoTrack);
        })
    } else {
      let videoTrack = this.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
      }
    }
  };

  async replacePeerVideoTracks(socketManager) {
    console.log("REPLACING TRACKS");
    console.log(socketManager.userPeerMap.length);
    console.log(socketManager.userPeerMap);

    if (socketManager) {
      socketManager.userPeerMap.forEach((peerObj) => {
        this.replacePeerVideoTrack(peerObj);
      });
    }
  }

  async replacePeerVideoTrack(peerObj) {
    if (peerObj.peer.connected) {
      try {
        peerObj.peer.replaceTrack(
          this.getVideoTracks()[0],
          this.videoTrack,
          this.obj
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
}
