class AppManager {
  constructor() {
    if (!AppManager.instance) {
      this.subscriptions = [];
      this.store = {
        apiHost: 'https://zapxs1m70d58030.corp.dsarena.com'
      };

      AppManager.instance = this;
    }

    return AppManager.instance;
  }

  setAPIHost = (apiHost) => {
    this.store.apiHost = apiHost;
  };

  getAPIHost = () => {
    return this.store.apiHost;
  };

/**
   * Fires an event.
   *
   * @param eventType eventType the event type
   * @param be the base event
   * @return false if any subscriptions cancel the event.
   */
  async fireEvent(eventType, be) {
  }
}

const instance = new AppManager();
//Object.freeze(instance);

export default instance;
