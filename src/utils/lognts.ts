export class Lognts {
  private pluginName: string = 'lognts';
  constructor(pluginName: string, color: string = '#66ccff') {
    this.pluginName = hexToAnsi('#66ccff') + `[${pluginName}] ` + '\x1b[0m';
  }
  public log(...args: any[]) {
    console.log(this.pluginName, ...args);
  }

  public warn(...args: any[]) {
    console.warn(this.pluginName, ...args);
  }
}

function hexToAnsi(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
}

