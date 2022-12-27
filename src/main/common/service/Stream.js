export class Stream {
  constructor() {
  }

  init = (video = true, audio = true, successHandler, errorhandler) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia(video ? {
        audio: audio,
        video: {
          width: 240,
          height: 240,
        }
      } : {
        audio: audio,
        video: false
      });

    userMedia
      .then((stream) => {
        this.obj = stream;
        if (successHandler) {
          successHandler(this.obj);
        }
      }).catch((e) => {
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
          track.enabled = false;
          track.stop()
        });
    }
  };

  addTrack = (track) => {
    this.obj.addTrack(track);
  };

  removeTrack = (track) => {
    this.obj.removeTrack(track);
  };

  getVideoTracks = (track) => {
    this.obj.getVideoTracks();
  };

  getTracks = () => {
    return this.obj.getTracks();
  };

  enableVideo = (enabled) => {
    if (!enabled) {
      this.obj
        .getVideoTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop();
          this.obj.removeTrack(track);
        });
    } else {
      let userMedia = navigator.mediaDevices
        .getUserMedia(
          {
            audio: false,
            video: true
          });
      userMedia
        .then((stream) => {
          this.videoTrack = stream.getTracks()[0];
          this.obj.addTrack(this.videoTrack);
        });
    }
  }
}
