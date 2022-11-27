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

  setCurrentView = (currentView) => {
    this.store.currentView = currentView;
  };

  getCurrentView = () => {
    return this.store.currentView;
  };

  add = (id, value) => {
    this.store[id] = value;
  };

  get = (id) => {
    return this.store[id];
  };

  remove = (id) => {
    delete this.store[id];
  };

  getUserDetails = () => {
    if (this.handler) {
      console.log("USER DETAILS : ", this.handler.getUserDetails());
      return this.handler.getUserDetails();
    }

    return this.store.userDetails;
  };

  /**
   * Adds a subscription bound by the given event type.
   *
   * @param handler the subscription to be added
   * @param eventTypes the subscription to be added
   */
  addSubscriptions = (handler, ...eventTypes) => {
    if (this.handler) {
      this.handler.addSubscriptions(handler, eventTypes);
    } else {
      for (const eventType of eventTypes) {
        this.subscriptions.push({
          handler,
          eventType
        });
      }
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
    if (this.handler) {
      this.handler.fireEvent(eventType, be);
    } else {
      for (const subscription of this.subscriptions) {
        if (subscription.eventType === eventType) {
          subscription.handler.api.on(eventType, be);
        }
      }
    }
  }

  removeSubscriptions = (eventHandler) => {
    if (this.handler) {
      this.handler.removeSubscriptions(eventHandler);
    } else {
      this.subscriptions = this.subscriptions.filter((sub) => sub.handler.api.id !== eventHandler.api.id);
    }
  };

  /**
   * Clears all event subscriptions
   *
   */
  clearAllEventListeners() {
    if (this.handler) {
      this.handler.clearAllEventListeners();
    } else {
      this.subscriptions.splice(0, this.subscriptions.length);
    }
  };
}

const instance = new AppManager();
Object.freeze(instance);

export default instance;
