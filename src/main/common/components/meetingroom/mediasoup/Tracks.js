export default class Tracks {
  constructor() {
  }

  stopVideoTrack = () => {
    if(this.videoTrack) {
      this.videoTrack.stop();
    }
  };

  setVideoTrack = (track) => {
    this.videoTrack = track;
  };

  stopAudioTrack = () => {
    if(this.audioTrack) {
      this.audioTrack.stop();
    }
  };

  setAudioTrack = (track) => {
    this.audioTrack = track;
  }
}
