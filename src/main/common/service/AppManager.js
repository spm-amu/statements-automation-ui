class AppManager {
  constructor() {
    if (!AppManager.instance) {
      this.subscriptions = [];
      this.store = {};
      AppManager.instance = this;
    }

    return AppManager.instance;
  }

  setUserDetails = (userDetails) => {
    this.store.userDetails = userDetails;
  };

  getUserDetails = () => {
    return this.store.userDetails;
  };

  /**
   * Adds a subscription bound by the given event type.
   *
   * @param handler the subscription to be added
   * @param eventTypes the subscription to be added
   */
  addSubscriptions = (handler, ...eventTypes) => {
    for (const eventType of eventTypes) {
      this.subscriptions.push({
        handler,
        eventType
      });
    }
  };

  /**
   * Fires an event.
   *
   * @param eventType eventType the event type
   * @param be the base event
   * @return false if any subscriptions cancel the event.
   */
  async fireEvent(eventType, be) {
    for (const subscription of this.subscriptions) {
      if (subscription.eventType === eventType) {
        subscription.handler.api.on(eventType, be);
      }
    }
  }

  removeSubscriptions = (handler) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.handler.api.id !== handler.api.id);
  };

  /**
   * Clears all event subscriptions
   *
   */
  clearAllEventListeners() {
    this.subscriptions.splice(0, this.subscriptions.length);
  };
}

const instance = new AppManager();
Object.freeze(instance);

export default instance;
