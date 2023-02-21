import { webFrame, contextBridge, ipcRenderer, IpcRendererEvent, desktopCapturer } from 'electron';

export type Channels = 'ipc-armscor';

if(screen.availHeight < 1024) {
  webFrame.setZoomFactor(.7);
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    getSources: () => ipcRenderer.invoke('get-sources'),
    removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
  },
});
