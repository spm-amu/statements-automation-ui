export class Stream {
  constructor() {
  }

  init = (video = true, audio = true, successHandler, errorhandler, retry = false, socketManager) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: audio,
        video: retry ? false : {
          width: 240,
          height: 240,
        }
      });

    userMedia
      .then((stream) => {
        let shareUserMedia = navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: retry ? false : {
              width: 240,
              height: 240,
            }
          });

        this.obj = stream;
        if (!video && stream.getVideoTracks().length > 0) {
          stream.getVideoTracks()[0].enabled = false;
          //stream.getVideoTracks()[0].stop();
        }

        shareUserMedia
          .then((stream) => {
            this.shareScreenObj = stream;
            stream.getAudioTracks()[0].enabled = false;
            if (stream.getVideoTracks().length > 0) {
              stream.getVideoTracks()[0].enabled = false;
            }

            if(this.obj.getAudioTracks().length > 0) {
              console.log("STREAM STARTED");
              console.log(this.obj.getAudioTracks()[0].enabled);
              console.log(this.obj.getAudioTracks()[0].muted);
            }
            if (successHandler) {
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
                            if (socketManager) {
                            console.log("REPLACING PEER TRACKS TRACKS");
                              socketManager.userPeerMap.forEach((peerObj) => {
                                peerObj.peer.replaceTrack(
                                  this.getAudioTracks()[0],
                                  newAudioTrack,
                                  this.obj
                                );
                              });
                            }

                            this.obj.removeTrack(this.getAudioTracks()[0]);
                          }

                          this.obj.addTrack(newAudioTrack);
                }
                );
              };
              successHandler(this.obj, this.shareScreenObj, stream.getVideoTracks().length === 0);
            }
          });
      }).catch((e) => {
        if(!retry) {
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

  close = () => {
    if (this.obj) {
      this.obj
        .getTracks()
        .forEach((track) => {
          track.stop();
          this.removeTrack(track);
        });
    }
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
              width: 240,
              height: 240,
            }
          });
      userMedia
        .then((stream) => {
          this.videoTrack = stream.getVideoTracks()[0];
          if (this.getVideoTracks().length > 0 && this.getVideoTracks()[0]) {
            if (socketManager) {
              socketManager.userPeerMap.forEach((peerObj) => {
                peerObj.peer.replaceTrack(
                  this.getVideoTracks()[0],
                  this.videoTrack,
                  this.obj
                );
              });
            }

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
  }
}
