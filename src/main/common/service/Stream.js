export class Stream {
  constructor() {
  }

  init = async (video = true, audio = true, successHandler, errorhandler, retry = false,
                socketManager, createScreenShareStream = true) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false
      });

    userMedia
      .then((stream) => {
        stream.getAudioTracks()[0].enabled = audio;
        this.obj = stream;
        if (!video && stream.getVideoTracks().length > 0) {
          stream.getVideoTracks()[0].enabled = false;
          //stream.getVideoTracks()[0].stop();
        }


        let shareUserMedia = navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: false
          });

        if (createScreenShareStream) {
          shareUserMedia
            .then((stream) => {
              this.shareScreenObj = stream;
              stream.getAudioTracks()[0].enabled = false;
              if (stream.getVideoTracks().length > 0) {
                stream.getVideoTracks()[0].enabled = false;
                stream.getVideoTracks()[0].stop();
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
                successHandler(this.obj, this.shareScreenObj, false);
              }
            });
        } else {
          if (successHandler) {
            successHandler(this.obj, null, false);
          }
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
          if (socketManager) {
            this.addVideoVideoTrackToPeers(socketManager);
          }

          if (this.getVideoTracks().length > 0 && this.getVideoTracks()[0]) {
            this.getVideoTracks()[0].stop();
            this.obj.removeTrack(this.getVideoTracks()[0]);
          }

          this.obj.addTrack(this.videoTrack);
        })
    } else {
      if (this.getVideoTracks().length > 0 && this.getVideoTracks()[0]) {
        let videoTrack = this.getVideoTracks()[0];
        if (socketManager) {
          socketManager.userPeerMap.forEach((peerObj) => {
            peerObj.peer.removeTrack(videoTrack,
              this.obj);
          });
        }
        if (videoTrack) {
          videoTrack.stop();
        }
      }
    }
  };

  async addVideoVideoTrackToPeers(socketManager) {
    console.log("REPLACING TRACKS");
    console.log(socketManager.userPeerMap.length);
    console.log(socketManager.userPeerMap);

    if (socketManager) {
      socketManager.userPeerMap.forEach((peerObj) => {
        this.addVideoTrackToPeer(peerObj);
      });
    }
  }

  async addVideoTrackToPeer(peerObj) {
    if (peerObj.peer.connected) {
      try {
        peerObj.peer.addTrack(
          this.videoTrack,
          this.obj
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
}
