import {
  setItem,
  getItem,
  removeItem,
  clear,
  migrateToVersion,
  getStorageVersion,
  hasItem,
  getAllKeys,
} from "../storage";

describe("storage", () => {
  const TEST_KEY = "test_key";
  const TEST_VALUE = { name: "test", value: 123 };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("setItem", () => {
    it("should store item with version", () => {
      setItem(TEST_KEY, TEST_VALUE);

      const stored = localStorage.getItem("v1:test_key");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored);
      expect(parsed._version).toBe("v1");
      expect(parsed.value).toEqual(TEST_VALUE);
      expect(parsed.timestamp).toBeDefined();
    });

    it("should handle non-object values", () => {
      setItem("string_key", "test_string");
      setItem("number_key", 42);
      setItem("boolean_key", true);

      expect(JSON.parse(localStorage.getItem("v1:string_key")).value).toBe(
        "test_string",
      );
      expect(JSON.parse(localStorage.getItem("v1:number_key")).value).toBe(42);
      expect(JSON.parse(localStorage.getItem("v1:boolean_key")).value).toBe(
        true,
      );
    });

    it("should handle storage errors gracefully", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      expect(() => setItem(TEST_KEY, TEST_VALUE)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe("getItem", () => {
    it("should retrieve stored item", () => {
      setItem(TEST_KEY, TEST_VALUE);

      const retrieved = getItem(TEST_KEY);
      expect(retrieved).toEqual(TEST_VALUE);
    });

    it("should return null for non-existent item", () => {
      const retrieved = getItem("non_existent_key");
      expect(retrieved).toBeNull();
    });

    it("should return null and remove item with wrong version", () => {
      localStorage.setItem(
        "v1:test_key",
        JSON.stringify({ _version: "v2", value: TEST_VALUE }),
      );

      const retrieved = getItem(TEST_KEY);
      expect(retrieved).toBeNull();
      expect(localStorage.getItem("v1:test_key")).toBeNull();
    });

    it("should handle invalid JSON gracefully", () => {
      localStorage.setItem("v1:test_key", "invalid json{");

      const retrieved = getItem(TEST_KEY);
      expect(retrieved).toBeNull();
      expect(localStorage.getItem("v1:test_key")).toBeNull();
    });
  });

  describe("removeItem", () => {
    it("should remove stored item", () => {
      setItem(TEST_KEY, TEST_VALUE);
      expect(getItem(TEST_KEY)).toEqual(TEST_VALUE);

      removeItem(TEST_KEY);
      expect(getItem(TEST_KEY)).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all versioned items", () => {
      setItem("key1", "value1");
      setItem("key2", "value2");
      localStorage.setItem("non_versioned", "value3");

      clear();

      expect(getItem("key1")).toBeNull();
      expect(getItem("key2")).toBeNull();
      expect(localStorage.getItem("non_versioned")).toBeNull();
    });
  });

  describe("migrateToVersion", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should set storage version", () => {
      migrateToVersion("v2");
      expect(localStorage.getItem("storage_version")).toBe("v2");
    });

    it("should not re-migrate if already on target version", () => {
      localStorage.setItem("storage_version", "v2");
      localStorage.setItem("v1:old_key", "old_value");

      migrateToVersion("v2");

      expect(localStorage.getItem("v1:old_key")).toBe("old_value");
    });

    it("should clear old version items", () => {
      localStorage.setItem("storage_version", "v1");
      localStorage.setItem("v1:key1", "value1");
      localStorage.setItem("v2:key2", "value2");

      migrateToVersion("v2");

      expect(localStorage.getItem("v1:key1")).toBeNull();
      expect(localStorage.getItem("v2:key2")).toBe("value2");
    });
  });

  describe("getStorageVersion", () => {
    it("should return current version", () => {
      localStorage.setItem("storage_version", "v2");
      expect(getStorageVersion()).toBe("v2");
    });

    it("should return default version if not set", () => {
      expect(getStorageVersion()).toBe("v1");
    });
  });

  describe("hasItem", () => {
    it("should return true for existing item", () => {
      setItem(TEST_KEY, TEST_VALUE);
      expect(hasItem(TEST_KEY)).toBe(true);
    });

    it("should return false for non-existing item", () => {
      expect(hasItem("non_existent")).toBe(false);
    });
  });

  describe("getAllKeys", () => {
    it("should return all versioned keys without prefix", () => {
      setItem("key1", "value1");
      setItem("key2", "value2");
      localStorage.setItem("v1:key3", "value3");
      localStorage.setItem("non_versioned", "value4");

      const keys = getAllKeys();
      expect(keys).toEqual(expect.arrayContaining(["key1", "key2", "key3"]));
      expect(keys).not.toContain("non_versioned");
    });

    it("should return empty array when no items", () => {
      expect(getAllKeys()).toEqual([]);
    });
  });
});
