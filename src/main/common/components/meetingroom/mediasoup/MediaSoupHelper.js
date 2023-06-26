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

  async initConsumerTransport(device, roomId, userId) {
    console.log("CREATING CONSUMER TRANSPORT FOR : " + userId);
    const data = await socketManager.emitEvent(MessageType.CREATE_WEBRTC_TRANSPORT, {
      forceTcp: false,
      userId,
      roomId
    });

    if (data.status === 'ERROR') {
      console.error(data.error);
      return;
    }

    let consumerTransport = device.createRecvTransport(data.params);
    consumerTransport.on(
      'connect',
      function ({dtlsParameters}, callback, errback) {
        socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
          dtlsParameters,
          transportId: data.id,
          userId,
          roomId
        }).then(callback)
          .catch(errback);
      }.bind(this)
    );

    consumerTransport.on(
      'connectionstatechange',
      async function (state) {
        switch (state) {
          case 'connecting':
            break;
          case 'connected':
            break;
          case 'failed':
            consumerTransport.close();
            break;
          default:
            break
        }
      }.bind(this)
    );

    return consumerTransport;
  }

  async initProducerTransport(device, roomId, userId) {
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

    let producerTransport = device.createSendTransport(data.params);
    producerTransport.on(
      'connect',
      async function ({dtlsParameters}, callback, errback) {
        socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
          dtlsParameters,
          transportId: data.id,
          roomId,
          userId
        }).then(callback)
          .catch(errback);
      }.bind(this)
    );

    producerTransport.on(
      'produce',
      async function ({kind, rtpParameters}, callback, errback) {
        try {
          const {producerId} = await socketManager.emitEvent(MessageType.PRODUCE, {
            producerTransportId: producerTransport.id,
            kind,
            rtpParameters,
            roomId,
            userId
          });

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
    );

    return producerTransport;
  }

  getConsumeStream = async (producerId, rtpCapabilities, consumerTransport, roomId, userId) => {
    const data = await socketManager.emitEvent(MessageType.CONSUME, {
      rtpCapabilities,
      consumerTransportId: consumerTransport.id,
      producerId,
      roomId,
      userId
    });

    const { id, kind, rtpParameters } = data.params;

    let codecOptions = {};
    const consumer = await consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    });

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    return {
      consumer,
      stream,
      kind
    }
  }
}

const instance = new MediaSoupHelper();
Object.freeze(instance);
export default instance;
