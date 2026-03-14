import {
  openInNewTab,
  handleDropdownAction,
  getUserInitials,
  getUserDisplayName,
  getUserDisplayEmail,
  getUserImage,
} from "../Login";

describe("Login - Exported Functions", () => {
  describe("openInNewTab", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      window.open = jest.fn();
    });

    it("should open new tab with security flags", () => {
      const openedWindow = { opener: {} };
      window.open.mockReturnValue(openedWindow);

      const result = openInNewTab("/settings");

      expect(window.open).toHaveBeenCalledWith(
        "/settings",
        "_blank",
        "noopener,noreferrer",
      );
      expect(openedWindow.opener).toBeNull();
      expect(result).toBe(openedWindow);
    });

    it("should return null when popup is blocked", () => {
      window.open.mockReturnValue(null);

      const result = openInNewTab("/settings");

      expect(result).toBeNull();
    });
  });

  describe("handleDropdownAction", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      window.open = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should handle logout action", () => {
      const { signOut } = require("next-auth/react");
      const result = handleDropdownAction("logout");

      expect(result).toBe(true);
      expect(signOut).toHaveBeenCalled();
    });

    it("should handle settings action", () => {
      const openedWindow = { opener: {} };
      window.open.mockReturnValue(openedWindow);
      const result = handleDropdownAction("settings");

      expect(result).toBe(true);
      expect(window.open).toHaveBeenCalledWith(
        "/settings",
        "_blank",
        "noopener,noreferrer",
      );
      expect(openedWindow.opener).toBeNull();
    });

    it("should handle unknown action", () => {
      const result = handleDropdownAction("unknown");

      expect(result).toBe(false);
    });

    it("should handle empty action", () => {
      const result = handleDropdownAction("");

      expect(result).toBe(false);
    });

    it("should handle null action", () => {
      const result = handleDropdownAction(null);

      expect(result).toBe(false);
    });

    it("should handle settings action when window is undefined", () => {
      const originalWindow = global.window;
      delete global.window;

      const result = handleDropdownAction("settings");

      expect(result).toBe(true);

      global.window = originalWindow;
    });
  });

  describe("getUserInitials", () => {
    it("should return first character of name", () => {
      expect(getUserInitials("John")).toBe("J");
    });

    it("should return ? for null", () => {
      expect(getUserInitials(null)).toBe("?");
    });

    it("should return ? for undefined", () => {
      expect(getUserInitials(undefined)).toBe("?");
    });

    it("should return ? for empty string", () => {
      expect(getUserInitials("")).toBe("?");
    });

    it("should return ? for non-string input", () => {
      expect(getUserInitials(123)).toBe("?");
      expect(getUserInitials({})).toBe("?");
      expect(getUserInitials([])).toBe("?");
    });

    it("should handle single character", () => {
      expect(getUserInitials("A")).toBe("A");
    });

    it("should handle special characters", () => {
      expect(getUserInitials("José María")).toBe("J");
    });

    it("should handle unicode characters", () => {
      expect(getUserInitials("用户")).toBe("用");
    });

    it("should handle whitespace", () => {
      expect(getUserInitials(" ")).toBe(" ");
    });

    it("should handle emoji", () => {
      const result = getUserInitials("A User");
      expect(result).toBe("A");
    });
  });

  describe("getUserDisplayName", () => {
    it("should return user name when exists", () => {
      const user = { name: "John Doe", email: "john@example.com" };
      expect(getUserDisplayName(user)).toBe("John Doe");
    });

    it("should return empty string when user is null", () => {
      expect(getUserDisplayName(null)).toBe("");
    });

    it("should return empty string when user is undefined", () => {
      expect(getUserDisplayName(undefined)).toBe("");
    });

    it("should return empty string when name is null", () => {
      const user = { name: null, email: "john@example.com" };
      expect(getUserDisplayName(user)).toBe("");
    });

    it("should return empty string when name is undefined", () => {
      const user = { email: "john@example.com" };
      expect(getUserDisplayName(user)).toBe("");
    });

    it("should return empty string when name is empty string", () => {
      const user = { name: "", email: "john@example.com" };
      expect(getUserDisplayName(user)).toBe("");
    });

    it("should handle special characters in name", () => {
      const user = { name: "José María", email: "jose@example.com" };
      expect(getUserDisplayName(user)).toBe("José María");
    });

    it("should handle unicode characters in name", () => {
      const user = { name: "用户 👋", email: "user@example.com" };
      expect(getUserDisplayName(user)).toBe("用户 👋");
    });

    it("should handle very long name", () => {
      const longName = "A".repeat(1000);
      const user = { name: longName, email: "user@example.com" };
      expect(getUserDisplayName(user)).toBe(longName);
    });
  });

  describe("getUserDisplayEmail", () => {
    it("should return user email when exists", () => {
      const user = { name: "John Doe", email: "john@example.com" };
      expect(getUserDisplayEmail(user)).toBe("john@example.com");
    });

    it("should return empty string when user is null", () => {
      expect(getUserDisplayEmail(null)).toBe("");
    });

    it("should return empty string when user is undefined", () => {
      expect(getUserDisplayEmail(undefined)).toBe("");
    });

    it("should return empty string when email is null", () => {
      const user = { name: "John Doe", email: null };
      expect(getUserDisplayEmail(user)).toBe("");
    });

    it("should return empty string when email is undefined", () => {
      const user = { name: "John Doe" };
      expect(getUserDisplayEmail(user)).toBe("");
    });

    it("should return empty string when email is empty string", () => {
      const user = { name: "John Doe", email: "" };
      expect(getUserDisplayEmail(user)).toBe("");
    });

    it("should handle special characters in email", () => {
      const user = { name: "John", email: "user+test@example.com" };
      expect(getUserDisplayEmail(user)).toBe("user+test@example.com");
    });
  });

  describe("getUserImage", () => {
    it("should return user image when exists", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      };
      expect(getUserImage(user)).toBe("https://example.com/avatar.jpg");
    });

    it("should return empty string when user is null", () => {
      expect(getUserImage(null)).toBe("");
    });

    it("should return empty string when user is undefined", () => {
      expect(getUserImage(undefined)).toBe("");
    });

    it("should return empty string when image is null", () => {
      const user = { name: "John Doe", email: "john@example.com", image: null };
      expect(getUserImage(user)).toBe("");
    });

    it("should return empty string when image is undefined", () => {
      const user = { name: "John Doe", email: "john@example.com" };
      expect(getUserImage(user)).toBe("");
    });

    it("should return empty string when image is empty string", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
        image: "",
      };
      expect(getUserImage(user)).toBe("");
    });

    it("should handle data URLs", () => {
      const user = {
        name: "John",
        email: "john@example.com",
        image: "data:image/png;base64,iVBORw0KGgo=",
      };
      expect(getUserImage(user)).toBe("data:image/png;base64,iVBORw0KGgo=");
    });
  });
});
