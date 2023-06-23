export default class MediaSoupHelper {
  constructor() {
  }

  static loadDevice = async (routerRtpCapabilities) => {
    let device;
    try {
      device = new this.mediasoupClient.Device()
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported');
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities
    });

    return device
  }
}
