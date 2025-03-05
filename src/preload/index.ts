import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('lib_moremenu', {
  // 获取waitGroup值
  getWaitGroup: () => ipcRenderer.invoke('lib.scb.moremenu.get-wait-group'),
  // more...
});