const STORAGE_VERSION = "v1";
const VERSION_KEY = "storage_version";

export function setItem(key, value) {
  const versionedKey = `${STORAGE_VERSION}:${key}`;
  const data = {
    _version: STORAGE_VERSION,
    value,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(versionedKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to set localStorage item: ${key}`, error);
  }
}

export function getItem(key) {
  const versionedKey = `${STORAGE_VERSION}:${key}`;
  const item = localStorage.getItem(versionedKey);

  if (!item) {
    return null;
  }

  try {
    const parsed = JSON.parse(item);

    if (parsed._version !== STORAGE_VERSION) {
      localStorage.removeItem(versionedKey);
      return null;
    }

    return parsed.value;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${key}`, error);
    localStorage.removeItem(versionedKey);
    return null;
  }
}

export function removeItem(key) {
  const versionedKey = `${STORAGE_VERSION}:${key}`;
  localStorage.removeItem(versionedKey);
}

export function clear() {
  const keysToDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.startsWith(STORAGE_VERSION) ||
      (!key.startsWith(STORAGE_VERSION) && key !== VERSION_KEY)
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
}

export function migrateToVersion(targetVersion) {
  const currentVersion = localStorage.getItem(VERSION_KEY);

  if (currentVersion === targetVersion) {
    return;
  }

  const keysToKeep = [];
  const keysToDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === VERSION_KEY) {
      continue;
    }
    if (key.startsWith(targetVersion)) {
      keysToKeep.push(key);
    } else {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(VERSION_KEY, targetVersion);
}

export function getStorageVersion() {
  return localStorage.getItem(VERSION_KEY) || STORAGE_VERSION;
}

export function hasItem(key) {
  const versionedKey = `${STORAGE_VERSION}:${key}`;
  return localStorage.getItem(versionedKey) !== null;
}

export function getAllKeys() {
  const keys = [];
  const prefix = `${STORAGE_VERSION}:`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(prefix)) {
      keys.push(key.slice(prefix.length));
    }
  }

  return keys;
}
