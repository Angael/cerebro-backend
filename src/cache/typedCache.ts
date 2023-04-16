import NodeCache from 'node-cache';

interface ICache<T> {
  has(key: NodeCache.Key): boolean;
  get(key: NodeCache.Key): T | undefined;
  set(key: NodeCache.Key, value: T): void;
  del(key: NodeCache.Key | NodeCache.Key[]): void;
  flushAll(): void;
}

// This allows for easier typing in code, because get returns good values
export class Cache<T> implements ICache<T> {
  private cache: NodeCache;

  constructor(options?: NodeCache.Options) {
    this.cache = new NodeCache(options);
  }

  public has(key) {
    return this.cache.has(key);
  }

  public get(key) {
    return this.cache.get(key) as T | undefined;
  }

  public set(key, value) {
    this.cache.set(key, value);
  }

  public del(key) {
    this.cache.del(key);
  }

  public flushAll() {
    this.cache.flushAll();
  }
}
