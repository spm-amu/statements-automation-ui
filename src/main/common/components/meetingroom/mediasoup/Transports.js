export default class Transports {
  constructor() {
  }

  closeProducerTransport = () => {
    if(this.producerTransport) {
      this.producerTransport.close();
    }
  };

  setProducerTransport = (producerTransport) => {
    this.producerTransport = producerTransport;
  };

  closeConsumerTransport = () => {
    if(this.consumerTransport) {
      this.consumerTransport.close();
    }
  };

  setConsumerTransport = (consumerTransport) => {
    this.consumerTransport = consumerTransport;
  }
}
