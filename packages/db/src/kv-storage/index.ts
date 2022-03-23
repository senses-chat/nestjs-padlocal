export * from './kv-storage.base';
export * from './redis.kv-storage';
export * from './prisma.kv-storage';

export const PADLOCAL_KV_STORAGE = Symbol.for('PadlocalKeyValueStorage');
