/* eslint-disable no-empty */
export const storageUtils = {
    set(key: string, value: any) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        // console.log(`📝 Storage SET: ${key} =`, value);
      } catch (e) {
        console.error(`❌ Storage SET error for ${key}:`, e);
      }
    },
    get(key: string) {
      try {
        const item = localStorage.getItem(key);
        if (item === null) {
          return null;
        }
        const parsed = JSON.parse(item);
        // console.log(`📖 Storage GET: ${key} =`, parsed);
        return parsed;
      } catch (e) {
        console.error(`❌ Storage GET error for ${key}:`, e);
        return null;
      }
    },
    remove(key: string) {
      localStorage.removeItem(key);
      console.log(`🗑️ Storage REMOVE: ${key}`);
    },
  
    clear() {
      console.error('🚨 Storage CLEAR called!');
      console.error('🚨 Stack trace:', new Error().stack);
      localStorage.clear();
    },
  };
  