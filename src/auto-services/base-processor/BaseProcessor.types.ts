export type BaseProcessorOptions<T extends { id: string | number }> = {
  checkInterval: number;
  concurrency: number;
  getItems: () => Promise<T[]>;
  processItem: (item: T) => Promise<void>;
  canProcessItem: (item: T) => Promise<boolean>;
  setItemStarted: (item: T) => Promise<void>;
  setItemProcessed: (item: T) => Promise<void>;
  onItemError: (item: T, error?: Error) => Promise<void>;
};
