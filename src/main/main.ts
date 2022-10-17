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
import { app, BrowserWindow, shell, ipcMain, systemPreferences, screen, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {resolveHtmlPath, resolveWindowHtmlPath} from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let dialWindow: BrowserWindow | null = null;
let screenWidth: number;
let screenHeight: number;

ipcMain.on('ipc-armscor', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-armscor', msgTemplate('pong'));
});

ipcMain.on('downloadFile', async (_event, { payload }) => {
  console.log('PAYLOAD: ', payload);
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
  dialWindow = new BrowserWindow({
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
    // Don't show the window until the user is in a call.
    show: false,
  });

  // preventRefresh(dialWindow);

  const dev = app.commandLine.hasSwitch("dev");
  if (!dev) {
    let level = "normal";
    // Mac OS requires a different level for our drag/drop and overlay
    // functionality to work as expected.
    if (process.platform === "darwin") {
      level = "floating";
    }

    dialWindow.setAlwaysOnTop(true, level);
  }

  dialWindow.loadURL(resolveWindowHtmlPath('index.html#/dialingPreview'));
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
    dialWindow = null;
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
  if (!dialWindow) {
    throw new Error('"dialingWindow" is not defined');
  }

  dialWindow.webContents.send('dialingViewContent', args);

  dialWindow.show();
  dialWindow.focus();
});

ipcMain.on("answerCall", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('answerCall', args);

  dialWindow?.hide();
});

ipcMain.on("declineCall", async (_event, args) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  mainWindow.webContents.send('declineCall', args);

  dialWindow?.hide();
});

ipcMain.on("cancelCall", async (_event, args) => {
  if (!dialWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  dialWindow.webContents.send('cancelCall', args);

  dialWindow?.hide();
});

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

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
