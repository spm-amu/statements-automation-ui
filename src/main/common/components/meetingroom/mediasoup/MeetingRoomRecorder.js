import socketManager from "../../../service/SocketManager";
import {MessageType} from "../../../types";

const {electron} = window;

class MeetingRoomRecorder {

  constructor() {
    this.meetingId = null;
    this.meetingTitle = '';
    this.recordingSequence = 0;
    this.currentRecordingId = null;
    this.recordingType = null;
    this.recordingSize = null;
    this.isRecording = false;
    this.recorder = null;
    this.audioTracks = new Map();
  }

  init = async (meetingId, meetingTitle) => {
    this.meetingId = meetingId;
    this.meetingTitle = meetingTitle;
  };

  addTrack = (id, track) => {
    console.log("ADDING TRACK FOR : " + id);
    this.audioTracks.set(id, track);

    if (this.recorder && this.recorder.state === 'recording') {
      let mediaStream = new MediaStream([track]);
      const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(
        this.audioContext,
        {mediaStream: mediaStream}
      );

      mediaStreamAudioSourceNode.connect(this.mediaStreamAudioDestinationNode);
    }
  };

  removeTrack = (id) => {
    if(this.audioTracks.has(id)) {
      this.audioTracks.delete(id);
    }
  };

  handleRecordingDataAvailable = (e) => {
    if (e.data.size > 0) {
      console.log("ADDED CHUNK : " + this.recordingSequence);
      const blob = new Blob([e.data], {
        type: "video/webm",
      });

      const data = {
        meetingId: this.meetingId,
        name: this.meetingTitle,
        type: blob.type,
        size: blob.size,
        sequenceNumber: this.recordingSequence,
        sessionId: this.currentRecordingId
      };

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      let _this = this;

      reader.onload = function (evt) {
        const result = evt.target.result;
        _this.recordingType = blob.type;
        _this.recordingSize += blob.size;

        data.recordedData = result.replace('data:video/webm;base64,', '');

        console.log("======== SAVING RECORDING CHUNK =========");
        console.log(data);
        socketManager.emitEvent(MessageType.SAVE_RECORDING, data)
          .then((data) => {
            console.log("===== SAVE RECORDING SUCCESS ======");
            if (!_this.isRecording) {
              console.log("======= STOPPING RECORDING =======", _this.meetingTitle);
              const data = {
                meetingId: _this.meetingId,
                name: _this.meetingTitle,
                type: _this.recordingType,
                size: _this.recordingSize,
                sequenceNumber: _this.recordingSequence,
                sessionId: _this.currentRecordingId
              };

              socketManager.emitEvent(MessageType.STOP_RECORDING, data)
                .catch((error) => {
                });
            }
          })
          .catch((error) => {
            console.log("===== SAVE RECORDING ERROR ======")
          });
      };

      _this.recordingSequence++;
    } else {
      console.log("no data to push");
    }
  };

  recordMeeting = async() => {
    this.recorder = await this.createMediaRecorder();
    let _this = this;
    if (this.recorder != null) {
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: _this.meetingId,
        isRecording: true
      }).then((data) => {
        console.log("RECORDING STARTED : " + data.id);
        _this.currentRecordingId = data.id;
        _this.recordingSequence = 0;
        _this.recordingSize = 0;
        _this.recordingType = '';
        _this.recorder.start(60000);
        _this.isRecording = true;
      }).catch((error) => {
        console.log("RECORD START ERROR");
        console.log(error);
      });
    }
  };

  stopRecordingMeeting = () => {
    try {
      this.isRecording = false;
      socketManager.emitEvent(MessageType.TOGGLE_RECORD_MEETING, {
        roomID: this.meetingId,
        isRecording: false
      }).catch((error) => {
      });

      if (this.recorder && this.recorder.state === 'recording') {
        if(this.recorder.stream?.getVideoTracks()?.length > 0) {
          this.recorder.stream?.getVideoTracks()[0].stop();
        }

        this.recorder.stop();
      }
    } catch (e) {
      console.error(e);
    }
  };

  handleStopRecording = (e) => {
    this.isRecording = false;
  };

  createMediaRecorder = () => {
    return new Promise((resolve, reject) => {
      electron.ipcRenderer.getMainWindowId()
        .then((id) => {
          if (id) {
            const videoConstraints = {
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720
                }
              }
            };

            let _this = this;
            navigator.mediaDevices
              .getUserMedia(videoConstraints)
              .then((stream) => {
                const options = {
                  mimeType: "video/webm; codecs=vp9"
                };

                let audioContext = new AudioContext();
                let mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);

                let tracks = [
                  mediaStreamAudioDestinationNode.stream.getAudioTracks()[0],
                  stream.getVideoTracks()[0]
                ];

                if(this.audioTracks.size > 0) {
                  for (const value of this.audioTracks.values()) {
                    tracks.push(value);
                    let mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(
                      audioContext,
                      {mediaStream: new MediaStream([value])}
                    );

                    mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
                  }
                } else {
                  let mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(
                    audioContext,
                    { mediaStream: new MediaStream(tracks) }
                  );

                  mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
                }

                console.log("INIT WITH TRACKS : ", tracks);
                let initialMediaStream = new MediaStream(tracks);

                const recorder = new MediaRecorder(initialMediaStream, options);
                recorder.ondataavailable = _this.handleRecordingDataAvailable;
                recorder.onstop = _this.handleStopRecording;

                this.audioContext = audioContext;
                this.mediaStreamAudioDestinationNode = mediaStreamAudioDestinationNode;

                resolve(recorder);
              })
              .catch(e => {
                console.error(e);
                reject(new Error(e.message));
              });
          } else {
            reject(new Error("Cannot initialize recorder. Application screen source not found"));
          }
        });
    });
  };
}

const instance = new MeetingRoomRecorder();
export default instance;

