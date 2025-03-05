import { BrowserWindow } from 'electron';
import { MoreMenuRegister } from '../register';

MoreMenuRegister.echo();

export const onBrowserWindowCreated = (window: BrowserWindow) => {
  // no need to call
  return;
};