const VIDEO_CONSTRAINTS = {
  mandatory: {
    width: {min: 160, ideal: 320, max: 640},
    height: {min: 120, ideal: 240, max: 480},
    frameRate: {
      min: 15,
      max: 15
    },
    googCpuOveruseDetection: true,
    googCpuOveruseEncodeUsage: true,
    googCpuOveruseThreshold: 70
  }
};

export class Stream {
  constructor() {
  }

  init = async (video = true, audio = true, successHandler, errorhandler, retry = false,
                socketManager, createScreenShareStream = true) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: retry || !video ? false : VIDEO_CONSTRAINTS
      });

    userMedia
      .then((stream) => {
        stream.getAudioTracks()[0].enabled = audio;
        this.obj = stream;
        let shareUserMedia = navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: shareScreenSource.current.id,
                width: {min: 160, ideal: 320, max: 640},
                height: {min: 120, ideal: 240, max: 480},
                frameRate: {
                  min: 15,
                  max: 15
                },
                googCpuOveruseDetection: true,
                googCpuOveruseEncodeUsage: true,
                googCpuOveruseThreshold: 70
              }
            }
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

  enableVideo = async (enabled, socketManager) => {
    return new Promise((resolve, reject) => {
      if (enabled) {
        let userMedia = navigator.mediaDevices
          .getUserMedia(
            {
              audio: false,
              video: VIDEO_CONSTRAINTS
            });
        userMedia
          .then((stream) => {
            this.videoTrack = stream.getVideoTracks()[0];

            if (socketManager) {
              this.videoTrack.enabled = true;
              this.replacePeerVideoTracks(socketManager);
            }

            if (this.getVideoTracks().length > 0 && this.getVideoTracks()[0]) {
              this.getVideoTracks()[0].stop();
              this.obj.removeTrack(this.getVideoTracks()[0]);
            }

            this.obj.addTrack(this.videoTrack);
            resolve(this.obj);
          })
      } else {
        let videoTrack = this.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }

        resolve(this.obj);
      }
    });
  };

  async replacePeerVideoTracks(socketManager) {
    if (socketManager) {
      socketManager.userPeerMap.forEach((peerObj) => {
        this.replacePeerVideoTrack(peerObj);
      });
    }
  }

  async replacePeerVideoTrack(peerObj) {
    if (peerObj.peer.connected) {
      try {
        if (this.obj.getVideoTracks().length > 0) {
          console.log("REPLACING AN EXISTING VIDEO TRACK");
          peerObj.peer.replaceTrack(
            this.getVideoTracks()[0],
            this.videoTrack,
            this.obj
          );
        } else {
          console.log("ADDING A NEW VIDEO TRACK");
          peerObj.peer.addTrack(
            this.videoTrack,
            this.obj
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
}
