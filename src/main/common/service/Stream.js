export class Stream {
  constructor() {
  }

  init = (video = true, audio = true, successHandler, errorhandler) => {
    let userMedia = navigator.mediaDevices
      .getUserMedia({
        audio: audio,
        video: video ? {
          width: 240,
          height: 240,
        } : null
      });

    userMedia
      .then((stream) => {
        if(audio) {
          this.audioTrack = stream.getTracks()[0];
        }

        if(video) {
          this.videoTrack = stream.getTracks()[1];
        }

        this.obj = stream;
        if(successHandler) {
          successHandler(this.obj);
        }
      }).catch((e) => {
        if(errorhandler) {
          errorhandler(e);
        }
    });
  };

  close = () => {
    if(this.obj) {
      this.obj
        .getTracks()
        .forEach((track) => {
          track.enabled = false;
          track.stop()
        });
    }

    if (this.audioTrack) {
      this.audioTrack.enabled = false;
      this.audioTrack.stop();
    }

    if (this.videoTrack) {
      this.videoTrack.enabled = false;
      this.videoTrack.stop();
    }
  };

  enableVideo = (enabled) => {
    if(this.videoTrack) {
      this.videoTrack.enabled = enabled;
      this.videoTrack.stop();
    }
  }
}
