import { MoreMenuManager } from '../utils/more_menu';
window.MoreMenuManager = MoreMenuManager;
MoreMenuManager.initialize();

export const onSettingWindowCreated = (view: HTMLElement) => {
  console.log('hello');
  // MoreMenuManager.__StartHook();
  return;
};