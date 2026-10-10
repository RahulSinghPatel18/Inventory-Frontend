const TOKEN_KEY = "inventory_token";
let memoryToken = null;
let warnedStorageUnavailable = false;

const warnStorageUnavailable = (error) => {
  if (warnedStorageUnavailable) return;
  warnedStorageUnavailable = true;
  console.warn("Persistent sign-in storage is unavailable; this session will not survive a page reload.", error);
};

export const storage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      warnStorageUnavailable(error);
      return memoryToken;
    }
  },

  setToken(token) {
    if (typeof token !== "string" || !token.trim()) {
      throw new TypeError("A non-empty authentication token is required");
    }
    memoryToken = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      warnStorageUnavailable(error);
    }
  },

  removeToken() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      warnStorageUnavailable(error);
    }
  }
};