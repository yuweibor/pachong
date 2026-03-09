/**
 * @file API wrapper for Electron main process functions exposed via preload script.
 */

const isApiAvailable = () => {
  return window.pachongApi && 
         typeof window.pachongApi.run === 'function' &&
         typeof window.pachongApi.saveConfig === 'function';
};

export const pachongApi = {
  /**
   * Runs the crawler in the main process.
   */
  run: (options: any): Promise<void> => {
    if (isApiAvailable()) {
      return window.pachongApi.run(options);
    }
    return Promise.reject(new Error('Pachong API not available.'));
  },

  /**
   * Stops the crawler in the main process.
   */
  stop: (): Promise<void> => {
    if (isApiAvailable()) {
      return window.pachongApi.stop();
    }
    return Promise.reject(new Error('Pachong API not available.'));
  },

  /**
   * Saves the crawler configuration to a local file.
   */
  saveConfig: (options: any): Promise<string> => {
    if (isApiAvailable()) {
      return window.pachongApi.saveConfig(options);
    }
    return Promise.reject(new Error('Pachong API not available.'));
  },

  onCrawlerUpdate: (callback: (value: any) => void) => {
    if (isApiAvailable()) {
      window.pachongApi.onCrawlerUpdate(callback);
    }
  },

  onCrawlerDone: (callback: (value: any) => void) => {
    if (isApiAvailable()) {
      window.pachongApi.onCrawlerDone(callback);
    }
  },
};
