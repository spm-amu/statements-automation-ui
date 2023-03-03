/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, systemPreferences, screen, desktopCapturer } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {resolveHtmlPath, resolveWindowHtmlPath} from './util';
import Store from "electron-store";

const store = new Store();

class AppUpdater {
  constructor() {
    log.transports.file.resolvePath = () => path.join('/Users/nsovongobeni/Work/Armscore/ui', '/logsmain.log');
    log.transports.file.level = 'debug';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let inComingCallWindow: BrowserWindow | null = null;
let messageWindow: BrowserWindow | null = null;
let meetingRoomWindow: BrowserWindow | null = null;
let screenWidth: number;
let screenHeight: number;

let deeplinkingUrl: string | undefined;

ipcMain.handle('get-sources', () => {
  return desktopCapturer
    .getSources({ types: ['window', 'screen', 'audio'] })
    .then(async sources => {
      if (mainWindow) {
        return sources.map((source) => ({
          id: source.id,
          name: source.name,
          appIconUrl: source?.appIcon?.toDataURL(),
          thumbnailUrl: source?.thumbnail
            ?.resize({ height: 160 })
            .toDataURL(),
        }));
      }

      return null;
  })
});

ipcMain.on('ipc-armscor', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-armscor', msgTemplate('pong'));
});

ipcMain.on('downloadFile', async (_event, { payload }) => {
  mainWindow?.webContents.downloadURL(payload.fileURL)
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createDialWindow = () => {
  // Create the browser window.
  inComingCallWindow = new BrowserWindow({
    title: "Armscor",
    width: 550,
    height: 300,
    maxWidth: 550,
    maxHeight: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    parent: mainWindow,
    roundedCorners: false,
    x: screenWidth - 600,
    y: screenHeight - 300,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
  });

  // preventRefresh(inComingCallWindow);

  const dev = app.commandLine.hasSwitch("dev");
  if (!dev) {
    let level = "normal";
    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }

    inComingCallWindow.setAlwaysOnTop(true, level);
  }

  inComingCallWindow.loadURL(resolveWindowHtmlPath('index.html#/incomingCall'));
};

const createMeetingRoomWindow = () => {
  // Create the browser window.
  meetingRoomWindow = new BrowserWindow({
    title: "Armscor",
    width: 1100,
    height: 600,
    maxWidth: 550,
    maxHeight: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreenable: false,
    parent: mainWindow,
    roundedCorners: false,
    x: screenWidth - 1200,
    y: screenHeight - 700,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
  });
  // preventRefresh(inComingCallWindow);

  const dev = app.commandLine.hasSwitch("dev");
  if (!dev) {
    let level = "normal";
    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }

    meetingRoomWindow.setAlwaysOnTop(false, level);
  }

  meetingRoomWindow.loadURL(resolveWindowHtmlPath('index.html#/meetingRoom'));
};

const createMessageWindow = () => {
  messageWindow = new BrowserWindow({
    title: "Armscor",
    width: 550,
    height: 300,
    maxWidth: 550,
    maxHeight: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    parent: mainWindow,
    roundedCorners: false,
    x: screenWidth - 600,
    y: screenHeight - 300,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
  });

  // preventRefresh(inComingCallWindow);

  const dev = app.commandLine.hasSwitch("dev");
  if (!dev) {
    let level = "normal";
    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }

    messageWindow.setAlwaysOnTop(true, level);
  }

  messageWindow.loadURL(resolveWindowHtmlPath('index.html#/messagePreview'));
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1152,
    height: 870,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.platform === "darwin") {
      systemPreferences.askForMediaAccess('microphone');
      systemPreferences.askForMediaAccess('camera');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    inComingCallWindow = null;
    messageWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

ipcMain.on("receivingCall", async (_event, args) => {
  if (!inComingCallWindow) {
    throw new Error('"incomingCallWindowContent" is not defined');
  }

  inComingCallWindow.webContents.send('incomingCallWindowContent', args);
  inComingCallWindow.show();
  inComingCallWindow.focus();
});

ipcMain.on("systemAlert", async (_event, args) => {
  if(!(args.currentMeetingId && args.payload.type === 'MEETING_STARTED_ALERT')) {
    if (!inComingCallWindow) {
      throw new Error('"dialingWindow" is not defined');
    }

    inComingCallWindow.webContents.send('dialingViewContent', args);
    inComingCallWindow.show();
    inComingCallWindow.focus();
  }
});

ipcMain.on("receivingMessage", async (_event, args) => {
  if (!messageWindow) {
    throw new Error('"messageWindow" is not defined');
  }

  messageWindow.webContents.send('messageViewContent', args);
  messageWindow.show();
  messageWindow.focus();
});

ipcMain.on("meetingRoomWindow", async (_event, args) => {
  if (!meetingRoomWindow) {
    throw new Error('meetingRoomWindow is not defined');
  }

  meetingRoomWindow.webContents.send('updateMeetingWindowContent', args);
  meetingRoomWindow.show();
  meetingRoomWindow.focus();
});

ipcMain.on("joinMeetingEvent", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('joinMeetingEvent', args);

  inComingCallWindow?.hide();
});

ipcMain.on("replyMessage", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('replyMessage', args);
  mainWindow.show();
  mainWindow.focus();

  messageWindow?.hide();
});

ipcMain.on("closeWindowEvent", async (_event) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  inComingCallWindow?.hide();
});

ipcMain.on("answerCall", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('answerCall', args);

  inComingCallWindow?.hide();
});

ipcMain.on("readTokens", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  let tokens = {} as any;
  tokens.accessToken = store.get('accessToken');
  tokens.refreshToken = store.get('refreshToken');

  tokens.pathResolve = resolveWindowHtmlPath('index.html#/incomingCall');

  let lastLogin = store.get('lastLogin') as string;
  tokens.lastLogin = new Date(parseFloat(lastLogin)).getTime();

  if(mainWindow) {
    mainWindow.webContents.send('tokensRead', tokens);
  }
});

ipcMain.on("saveTokens", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  store.set('accessToken', args.accessToken);
  store.set('refreshToken', args.refreshToken);
  store.set('lastLogin', args.lastLogin);

  mainWindow.webContents.send('tokensSaved', args);
});

ipcMain.on("removeTokens", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  store.delete('accessToken');
  store.delete('refreshToken');
  store.delete('lastLogin');

  mainWindow.webContents.send('tokensRemoved', args);
});

ipcMain.on("declineCall", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('declineCall', args);

  inComingCallWindow?.hide();
});

ipcMain.on("cancelCall", async (_event, args) => {
  if (!inComingCallWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  inComingCallWindow.webContents.send('cancelCall', args);

  inComingCallWindow?.hide();
});

ipcMain.on("hideMessagePreview", async (_event, args) => {
  if (messageWindow) {
    messageWindow.hide();
  }
});

if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  // Setting this is required to get this working in dev mode.
  app.setAsDefaultProtocolClient('armscor-connect', process.execPath, [
    path.resolve(process.argv[1])
  ]);
} else {
  app.setAsDefaultProtocolClient('armscor-connect');
}

app.on('open-url', function (event, url) {
  event.preventDefault();
  deeplinkingUrl = url;
  let meetingId = null;
  let accessToken = null;

  log.info('Opening Link...');

  if (deeplinkingUrl) {
    const lastIndex = deeplinkingUrl.lastIndexOf('/');
    const query = deeplinkingUrl.slice(lastIndex + 1);

    const params = new URLSearchParams(query);
    meetingId = params.get('meetingId');
    accessToken = params.get('accessToken');
  }

  if (mainWindow) {
    log.info('Sending joinMeetingEvent...');

    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    mainWindow.webContents.send('joinMeetingEvent', {
      payload: {
        params: {
          meetingId: meetingId,
          accessToken: accessToken,
          redirect: true
        }
      }
    });
  }
});

// Force single application instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (e, argv) => {
    if (process.platform !== 'darwin') {
      // Find the arg that is our custom protocol url and store it
      deeplinkingUrl = argv.find((arg) => arg.startsWith('armscor-connect://'));
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    screenWidth = width;
    screenHeight = height;

    createWindow();
    createDialWindow();
    createMessageWindow();
    createMeetingRoomWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
