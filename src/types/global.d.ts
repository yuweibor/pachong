export {};

declare global {
  interface Window {
    pachongApi: {
      run: (options: any) => Promise<void>;
      stop: () => Promise<void>;
      saveConfig: (options: any) => Promise<string>;
      onCrawlerUpdate: (callback: (value: any) => void) => void;
      onCrawlerDone: (callback: (value: any) => void) => void;
    };
  }
}
