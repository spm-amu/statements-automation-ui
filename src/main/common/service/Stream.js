export class Stream {
  constructor() {
  }

  init = (video = true, audio = true, successHandler, errorhandler) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: audio,
        video: {
          width: 240,
          height: 240,
        }
      });

    userMedia
      .then((stream) => {
        let shareUserMedia = navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              width: 240,
              height: 240,
            }
          });

        this.obj = stream;
        if (!video) {
          stream.getVideoTracks()[0].enabled = false;
          //stream.getVideoTracks()[0].stop();
        }

        shareUserMedia
          .then((stream) => {
            this.shareScreenObj = stream;
            stream.getVideoTracks()[0].enabled = false;
            console.log("STREAM STARTED");
            if (successHandler) {
              successHandler(this.obj);
            }
          });
      }).catch((e) => {
      console.log("STREAM FAILED");
      console.log(e);
      if (errorhandler) {
        errorhandler(e);
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
