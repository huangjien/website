import {
  getValueByPath,
  hashCode,
  setMessage,
  getReadme,
  getRawContent,
  getIssues,
  getLabels,
  isMember,
  getJoke,
  getUser,
  properties2Json,
} from "../Requests";

// Mock fetch globally
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

describe("Requests utility functions", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
  });

  describe("getValueByPath", () => {
    it("should get nested value by path", () => {
      const data = {
        user: {
          profile: {
            name: "John Doe",
            age: 30,
          },
        },
      };

      expect(getValueByPath(data, "user.profile.name")).toBe("John Doe");
      expect(getValueByPath(data, "user.profile.age")).toBe(30);
    });

    it("should return undefined for non-existent path", () => {
      const data = { user: { name: "John" } };

      expect(getValueByPath(data, "user.profile.name")).toBeUndefined();
      expect(getValueByPath(data, "nonexistent.path")).toBeUndefined();
    });

    it("should handle null/undefined data", () => {
      expect(getValueByPath(null, "user.name")).toBeUndefined();
      expect(getValueByPath(undefined, "user.name")).toBeUndefined();
    });

    it("should handle null/undefined path", () => {
      const data = { user: { name: "John" } };

      expect(getValueByPath(data, null)).toBeUndefined();
      expect(getValueByPath(data, undefined)).toBeUndefined();
    });

    it("should handle empty path", () => {
      const data = { user: { name: "John" } };

      expect(getValueByPath(data, "")).toBe(data);
    });
  });

  describe("hashCode", () => {
    it("should generate consistent hash for same string", () => {
      const str = "test string";
      const hash1 = hashCode(str);
      const hash2 = hashCode(str);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("number");
    });

    it("should generate different hashes for different strings", () => {
      const hash1 = hashCode("string1");
      const hash2 = hashCode("string2");

      expect(hash1).not.toBe(hash2);
    });

    it("should return 0 for empty or null string", () => {
      expect(hashCode("")).toBe(0);
      expect(hashCode(null)).toBe(0);
      expect(hashCode(undefined)).toBe(0);
    });

    it("should handle special characters", () => {
      const hash = hashCode("!@#$%^&*()");
      expect(typeof hash).toBe("number");
    });
  });

  describe("setMessage", () => {
    it("should store message in sessionStorage", () => {
      setMessage("success", "Operation completed");

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "message",
        JSON.stringify({
          messageType: "success",
          message: "Operation completed",
        }),
      );
    });

    it("should handle different message types", () => {
      setMessage("error", "Something went wrong");

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "message",
        JSON.stringify({
          messageType: "error",
          message: "Something went wrong",
        }),
      );
    });
  });

  describe("getReadme", () => {
    it("should fetch readme content", async () => {
      const mockContent = "# README\nThis is a test readme";
      fetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockContent),
      });

      const result = await getReadme();

      expect(fetch).toHaveBeenCalledWith("/api/about", {
        method: "GET",
      });
      expect(result).toBe(mockContent);
    });

    it("should handle fetch errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getReadme()).rejects.toThrow("Network error");
    });
  });

  describe("getRawContent", () => {
    it("should fetch content from given URL", async () => {
      const mockContent = "Raw content";
      const testUrl = "https://example.com/content";

      fetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockContent),
      });

      const result = await getRawContent(testUrl);

      expect(fetch).toHaveBeenCalledWith(testUrl, {
        method: "GET",
      });
      expect(result).toBe(mockContent);
    });
  });

  describe("getIssues", () => {
    it("should fetch issues", async () => {
      const mockIssues = '[{"id": 1, "title": "Test Issue"}]';
      fetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockIssues),
      });

      const result = await getIssues();

      expect(fetch).toHaveBeenCalledWith("/api/issues", {
        method: "GET",
      });
      expect(result).toBe(mockIssues);
    });
  });

  describe("getLabels", () => {
    it("should fetch and parse labels", async () => {
      const mockLabels = [{ name: "bug", color: "red" }];
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockLabels),
      });

      const result = await getLabels();

      expect(fetch).toHaveBeenCalledWith("/api/labels", {
        method: "GET",
      });
      expect(result).toEqual(mockLabels);
    });
  });

  describe("isMember", () => {
    it("should check member status", async () => {
      const mockMemberData = { isMember: true };
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockMemberData),
      });

      const result = await isMember();

      expect(fetch).toHaveBeenCalledWith("/api/member", {
        method: "GET",
      });
      expect(result).toEqual(mockMemberData);
    });
  });

  describe("getJoke", () => {
    it("should fetch programming joke", async () => {
      const mockJoke = {
        type: "twopart",
        setup: "Why do programmers prefer dark mode?",
        delivery: "Because light attracts bugs!",
      };

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockJoke),
      });

      const result = await getJoke();

      expect(fetch).toHaveBeenCalledWith(
        "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart",
        { method: "GET" },
      );
      expect(result).toEqual(mockJoke);
    });
  });

  describe("getUser", () => {
    it("should return cached user if available", async () => {
      const cachedUser = { login: "testuser", id: 123 };
      mockSessionStorage.getItem.mockReturnValueOnce(
        JSON.stringify(cachedUser),
      );

      const result = await getUser("testuser", "token");

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith("currentUser");
      expect(result).toEqual(cachedUser);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should fetch user from GitHub API if not cached", async () => {
      const mockUser = { login: "testuser", id: 123 };
      mockSessionStorage.getItem.mockReturnValueOnce(null);
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockUser),
      });

      const result = await getUser("testuser", "token");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser",
        {
          method: "GET",
          headers: {
            Authorization: "token token",
          },
        },
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("properties2Json", () => {
    it("should convert properties string to JSON array", () => {
      const propertiesString = `name=John Doe
age=30
email=john@example.com`;

      const result = properties2Json(propertiesString);

      expect(result).toEqual([
        { key: 0, name: "name", value: "John Doe" },
        { key: 1, name: "age", value: "30" },
        { key: 2, name: "email", value: "john@example.com" },
      ]);
    });

    it("should handle properties without values", () => {
      const propertiesString = `name=John\nflag=\nempty`;

      const result = properties2Json(propertiesString);

      expect(result).toEqual([
        { key: 0, name: "name", value: "John" },
        { key: 1, name: "flag", value: "" },
        { key: 2, name: "empty", value: "" },
      ]);
    });

    it("should handle empty or null input", () => {
      expect(properties2Json("")).toEqual([]);
      expect(properties2Json(null)).toEqual([]);
      expect(properties2Json(undefined)).toEqual([]);
    });

    it("should handle properties with spaces", () => {
      const propertiesString = `  name  =  John Doe  \n  age  =  30  `;

      const result = properties2Json(propertiesString);

      expect(result).toEqual([
        { key: 0, name: "name", value: "John Doe" },
        { key: 1, name: "age", value: "30" },
      ]);
    });

    it("should skip empty lines", () => {
      const propertiesString = `name=John\n\nage=30\n\n`;

      const result = properties2Json(propertiesString);

      expect(result).toEqual([
        { key: 0, name: "name", value: "John" },
        { key: 2, name: "age", value: "30" },
      ]);
    });
  });
});
