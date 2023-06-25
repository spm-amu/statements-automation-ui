import {Device} from "mediasoup-client";
import {MessageType} from "../../../types";
import socketManager from "../../../../common/service/SocketManager";

class MediaSoupHelper {
  constructor() {
  }

  getParticipantDevice = async (routerRtpCapabilities) => {
    let device;

    try {
      device = new Device()
    } catch (error) {
      console.error(error)
    }

    await device.load({
      routerRtpCapabilities
    });

    return device
  };

  async initTransports(device, roomId, userId) {
    let producerTransport;
    let consumerTransport;

    // init producerTransport
    {
      const data = await socketManager.emitEvent(MessageType.CREATE_WEBRTC_TRANSPORT, {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities,
        roomId,
        userId
      });

      if (data.status === 'ERROR') {
        console.error(data.error);
        return;
      }

      producerTransport = device.createSendTransport(data);
      producerTransport.on(
        'connect',
        async function ({dtlsParameters}, callback, errback) {
          socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
            dtlsParameters,
            transportId: data.id
          }).then(callback)
            .catch(errback);
        }.bind(this)
      );

      producerTransport.on(
        'produce',
        async function ({kind, rtpParameters}, callback, errback) {
          try {
            const {producerId} = socketManager.emitEvent(MessageType.PRODUCE, {
              producerTransportId: producerTransport.id,
              kind,
              rtpParameters
            }).then(callback)
              .catch(errback);

            callback({
              id: producerId
            })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
      );

      producerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break;
            case 'connected':
              break;
            case 'failed':
              this.producerTransport.close();
              break;
            default:
              break
          }
        }.bind(this)
      )
    }

    // init consumerTransport
    {
      const data = await socketManager.emitEvent(MessageType.CREATE_WEBRTC_TRANSPORT, {
        forceTcp: false
      });

      if (data.status === 'ERROR') {
        console.error(data.error);
        return;
      }

      // only one needed
      consumerTransport = device.createRecvTransport(data);
      consumerTransport.on(
        'connect',
        function ({dtlsParameters}, callback, errback) {
          socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
            dtlsParameters,
            transportId: data.id
          }).then(callback)
            .catch(errback);
        }.bind(this)
      );

      this.consumerTransport.on(
        'connectionstatechange',
        async function (state) {
          switch (state) {
            case 'connecting':
              break;
            case 'connected':
              break;
            case 'failed':
              this.consumerTransport.close();
              break;
            default:
              break
          }
        }.bind(this)
      )
    }

    return {
      producerTransport,
      consumerTransport
    }
  }
}

const instance = new MediaSoupHelper();
Object.freeze(instance);
export default instance;
