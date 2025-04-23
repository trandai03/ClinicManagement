/* eslint-disable no-empty */
export const storageUtils = {
    set(key: string, value: any) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    },
    get(key: string) {
      try {
        return JSON.parse(localStorage.getItem(key) || '');
      } catch (e) {
        return null;
      }
    },
    remove(key: string) {
      localStorage.removeItem(key);
    },
  
    clear() {
      localStorage.clear();
    },
  };
  