export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        send(channel: string, ...args: any[]): void;
        on(channel: string, callback: (event: any, ...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
      };
    };
  }
}
