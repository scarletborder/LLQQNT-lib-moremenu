
import { ipcMain } from 'electron';
import { Lognts } from './utils/lognts';

const logger = new Lognts('menu_register');

class _MoreMenuRegister {
  private waitGroup: number = 0;
  private registeredPlugins: Set<string> = new Set();

  constructor() {
    this.setupListeners();
    logger.log('MoreMenuRegister initialized.');
  }

  public echo() {
    logger.log('Echo from MoreMenuRegister.');
  }

  public registerPlugin(pluginName: string) {
    if (this.registeredPlugins.has(pluginName)) {
      logger.warn(`Plugin ${pluginName} is already registered.`);
      return;
    }
    this.registeredPlugins.add(pluginName);
    this.waitGroup += 1;
    logger.log(`Plugin ${pluginName} registered. Current waitGroup: ${this.waitGroup}`);
  }

  // 设置 IPC 监听器
  private setupListeners() {
    ipcMain.handle('lib.scb.moremenu.get-wait-group', () => {
      return this.waitGroup;
    });
  }
}

export const MoreMenuRegister = new _MoreMenuRegister();
global.MoreMenuRegister = MoreMenuRegister;
