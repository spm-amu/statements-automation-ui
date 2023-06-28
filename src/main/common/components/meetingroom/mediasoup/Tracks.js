export default class Tracks {
  constructor() {
  }

  stopVideoTrack = () => {
    if(this.videoTrack) {
      this.videoTrack.stop();
    }
  };

  setVideoTrack = () => {
    this.setVideoTrack();
  };

  stopAudioTrack = () => {
    if(this.audioTrack) {
      this.audioTrack.stop();
    }
  };

  setAudioTrack = () => {
    this.setAudioTrack();
  }
}
