import { success, info, warn, error } from "../Notification";
import { toast } from "react-toastify";

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Notification Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success function", () => {
    it("should call toast.success with the provided message", () => {
      const message = "Operation completed successfully";

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string message", () => {
      const message = "";

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it("should handle null message", () => {
      const message = null;

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it("should handle undefined message", () => {
      const message = undefined;

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it("should handle long message", () => {
      const message =
        "This is a very long success message that contains multiple words and should be handled properly by the notification system";

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it("should handle message with special characters", () => {
      const message =
        "Success! 🎉 Operation completed with 100% accuracy & efficiency.";

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });
  });

  describe("info function", () => {
    it("should call toast.info with the provided message", () => {
      const message = "Information message";

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
      expect(toast.info).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string message", () => {
      const message = "";

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });

    it("should handle null message", () => {
      const message = null;

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });

    it("should handle undefined message", () => {
      const message = undefined;

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });

    it("should handle numeric message", () => {
      const message = 12345;

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });

    it("should handle boolean message", () => {
      const message = true;

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });
  });

  describe("warn function", () => {
    it("should call toast.warn with the provided message and autoClose option", () => {
      const message = "Warning message";

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
      expect(toast.warn).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string message", () => {
      const message = "";

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });

    it("should handle null message", () => {
      const message = null;

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });

    it("should handle undefined message", () => {
      const message = undefined;

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });

    it("should handle object message", () => {
      const message = { warning: "This is a warning" };

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });

    it("should handle array message", () => {
      const message = ["Warning 1", "Warning 2"];

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });
  });

  describe("error function", () => {
    it("should call toast.error with the provided message and autoClose option", () => {
      const message = "Error message";

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string message", () => {
      const message = "";

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });

    it("should handle null message", () => {
      const message = null;

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });

    it("should handle undefined message", () => {
      const message = undefined;

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });

    it("should handle Error object", () => {
      const message = new Error("Something went wrong");

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });

    it("should handle message with HTML tags", () => {
      const message = "<strong>Error:</strong> Operation failed";

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });
  });

  describe("multiple function calls", () => {
    it("should handle multiple success calls", () => {
      success("First success");
      success("Second success");
      success("Third success");

      expect(toast.success).toHaveBeenCalledTimes(3);
      expect(toast.success).toHaveBeenNthCalledWith(1, "First success");
      expect(toast.success).toHaveBeenNthCalledWith(2, "Second success");
      expect(toast.success).toHaveBeenNthCalledWith(3, "Third success");
    });

    it("should handle mixed notification types", () => {
      success("Success message");
      info("Info message");
      warn("Warning message");
      error("Error message");

      expect(toast.success).toHaveBeenCalledWith("Success message");
      expect(toast.info).toHaveBeenCalledWith("Info message");
      expect(toast.warn).toHaveBeenCalledWith("Warning message", {
        autoClose: 8000,
      });
      expect(toast.error).toHaveBeenCalledWith("Error message", {
        autoClose: false,
      });

      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid successive calls", () => {
      for (let i = 0; i < 10; i++) {
        info(`Message ${i}`);
      }

      expect(toast.info).toHaveBeenCalledTimes(10);
    });
  });

  describe("function exports", () => {
    it("should export all notification functions", () => {
      expect(typeof success).toBe("function");
      expect(typeof info).toBe("function");
      expect(typeof warn).toBe("function");
      expect(typeof error).toBe("function");
    });

    it("should have correct function names", () => {
      expect(success.name).toBe("success");
      expect(info.name).toBe("info");
      expect(warn.name).toBe("warn");
      expect(error.name).toBe("error");
    });
  });

  describe("edge cases", () => {
    it("should handle function as message", () => {
      const message = () => "Function message";

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it("should handle symbol as message", () => {
      const message = Symbol("test");

      info(message);

      expect(toast.info).toHaveBeenCalledWith(message);
    });

    it("should handle BigInt as message", () => {
      const message = BigInt(123456789);

      warn(message);

      expect(toast.warn).toHaveBeenCalledWith(message, { autoClose: 8000 });
    });

    it("should handle Date object as message", () => {
      const message = new Date("2023-01-01");

      error(message);

      expect(toast.error).toHaveBeenCalledWith(message, { autoClose: false });
    });

    it("should handle RegExp as message", () => {
      const message = /test-pattern/g;

      success(message);

      expect(toast.success).toHaveBeenCalledWith(message);
    });
  });
});
