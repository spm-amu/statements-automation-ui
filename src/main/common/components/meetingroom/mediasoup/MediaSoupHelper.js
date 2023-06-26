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
       ({dtlsParameters}, callback, errback) => {
        socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
          dtlsParameters,
          transportId: data.id,
          userId,
          roomId
        }).then(callback)
          .catch(errback);
      }
    );

    consumerTransport.on(
      'connectionstatechange',
      async (state) => {
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
      }
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
      async ({dtlsParameters}, callback, errback) => {
        socketManager.emitEvent(MessageType.CONNECT_TRANSPORT, {
          dtlsParameters,
          transportId: data.id,
          roomId,
          userId
        }).then(callback)
          .catch(errback);
      }
    );

    producerTransport.on(
      'produce',
      async ({kind, rtpParameters}, callback, errback) => {
        try {
          const {producerId} = socketManager.emitEvent(MessageType.PRODUCE, {
            producerTransportId: producerTransport.id,
            kind,
            rtpParameters,
            roomId,
            userId
          }).then(callback)
            .catch(errback);

          callback({
            id: producerId
          })
        } catch (err) {
          errback(err)
        }
      }
    );

    producerTransport.on(
      'connectionstatechange',
      (state) => {
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
      }
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
