import {
  sanitizeHtml,
  sanitizeMarkdown,
  validateEmail,
  validateUrl,
  validateStringLength,
  validateNumber,
  validateEnum,
  validateObject,
  sanitizeInput,
} from "../validation";

describe("validation utilities", () => {
  describe("sanitizeHtml", () => {
    it("should sanitize HTML by converting special characters", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
      );
    });

    it("should handle all special characters", () => {
      const input = "<div>&\"'/</div>";
      const result = sanitizeHtml(input);
      expect(result).toBe(
        "&lt;div&gt;&amp;&quot;&#x27;&#x2F;&lt;&#x2F;div&gt;",
      );
    });

    it("should throw error for non-string input", () => {
      expect(() => sanitizeHtml(null)).toThrow(TypeError);
      expect(() => sanitizeHtml(123)).toThrow(TypeError);
    });

    it("should handle empty string", () => {
      expect(sanitizeHtml("")).toBe("");
    });
  });

  describe("sanitizeMarkdown", () => {
    it("should remove script tags", () => {
      const input = "Hello <script>alert('xss')</script> world";
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello  world");
    });

    it("should remove iframe tags", () => {
      const input = '<iframe src="evil.com"></iframe>';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain("<iframe>");
    });

    it("should remove object tags", () => {
      const input = '<object data="evil.swf"></object>';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain("<object>");
    });

    it("should remove embed tags", () => {
      const input = '<embed src="evil.swf">';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain("<embed>");
    });

    it("should remove javascript: protocol", () => {
      const input = '[Click](javascript:alert("xss"))';
      const result = sanitizeMarkdown(input);
      expect(result.toLowerCase()).not.toContain("javascript:");
    });

    it("should remove event handlers", () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = sanitizeMarkdown(input);
      expect(result.toLowerCase()).not.toContain("onerror");
    });

    it("should return empty string for non-string input", () => {
      expect(sanitizeMarkdown(null)).toBe("");
      expect(sanitizeMarkdown(undefined)).toBe("");
      expect(sanitizeMarkdown(123)).toBe("");
    });

    it("should handle empty string", () => {
      expect(sanitizeMarkdown("")).toBe("");
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com").valid).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk").valid).toBe(true);
      expect(validateEmail("user123@test-domain.com").valid).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid").valid).toBe(false);
      expect(validateEmail("invalid@").valid).toBe(false);
      expect(validateEmail("@example.com").valid).toBe(false);
      expect(validateEmail("test@.com").valid).toBe(false);
    });

    it("should reject non-string input", () => {
      expect(validateEmail(123).valid).toBe(false);
      expect(validateEmail(null).valid).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("should validate correct URLs", () => {
      expect(validateUrl("http://example.com").valid).toBe(true);
      expect(validateUrl("https://example.com").valid).toBe(true);
      expect(validateUrl("https://example.com/path?query=value").valid).toBe(
        true,
      );
    });

    it("should reject non-HTTP/HTTPS protocols", () => {
      const result = validateUrl("ftp://example.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("HTTP or HTTPS");
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("not-a-url").valid).toBe(false);
      expect(validateUrl("http://").valid).toBe(false);
    });

    it("should reject non-string input", () => {
      expect(validateUrl(123).valid).toBe(false);
      expect(validateUrl(null).valid).toBe(false);
    });
  });

  describe("validateStringLength", () => {
    it("should validate strings within length constraints", () => {
      const result = validateStringLength("hello", { min: 3, max: 10 });
      expect(result.valid).toBe(true);
    });

    it("should reject strings shorter than min", () => {
      const result = validateStringLength("hi", { min: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least 3");
    });

    it("should reject strings longer than max", () => {
      const result = validateStringLength("hello world", { max: 5 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("no more than 5");
    });

    it("should handle required validation", () => {
      const result = validateStringLength(null, {
        min: 3,
        max: 10,
        required: true,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });

    it("should allow undefined when not required", () => {
      const result = validateStringLength(undefined, {
        min: 3,
        max: 10,
        required: false,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject non-string input", () => {
      const result = validateStringLength(123, { min: 1 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must be a string");
    });
  });

  describe("validateNumber", () => {
    it("should validate numbers within range", () => {
      const result = validateNumber(5, { min: 0, max: 10 });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(5);
    });

    it("should reject numbers below min", () => {
      const result = validateNumber(-1, { min: 0 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least 0");
    });

    it("should reject numbers above max", () => {
      const result = validateNumber(11, { max: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at most 10");
    });

    it("should validate integers", () => {
      expect(validateNumber(5, { integer: true }).valid).toBe(true);
      expect(validateNumber(5.5, { integer: true }).valid).toBe(false);
    });

    it("should handle NaN", () => {
      const result = validateNumber(NaN, {});
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must be a number");
    });

    it("should handle required validation", () => {
      const result = validateNumber(null, { required: true });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });

    it("should convert string numbers to numbers", () => {
      const result = validateNumber("42", {});
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });
  });

  describe("validateEnum", () => {
    it("should validate allowed enum values", () => {
      const result = validateEnum("admin", ["user", "admin", "guest"]);
      expect(result.valid).toBe(true);
    });

    it("should reject disallowed enum values", () => {
      const result = validateEnum("superadmin", ["user", "admin", "guest"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("must be one of");
    });

    it("should handle required validation", () => {
      const result = validateEnum(null, ["a", "b"], { required: true });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });

    it("should allow undefined when not required", () => {
      const result = validateEnum(undefined, ["a", "b"], {
        required: false,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("validateObject", () => {
    it("should validate object against schema", () => {
      const schema = {
        name: (value) => validateStringLength(value, { min: 2, max: 50 }),
        age: (value) => validateNumber(value, { min: 0, max: 120 }),
        email: (value) => validateEmail(value),
      };

      const result = validateObject(
        {
          name: "John",
          age: 30,
          email: "john@example.com",
        },
        schema,
      );

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
      });
    });

    it("should collect validation errors", () => {
      const schema = {
        name: (value) => validateStringLength(value, { min: 2 }),
        age: (value) => validateNumber(value, { min: 0 }),
      };

      const result = validateObject(
        {
          name: "J",
          age: -1,
          extra: "field",
        },
        schema,
        { allowUnknown: true },
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("name");
      expect(result.errors[1]).toContain("age");
    });

    it("should handle allowUnknown option", () => {
      const schema = {
        name: () => ({ valid: true }),
      };

      const result = validateObject(
        {
          name: "John",
          unknown: "field",
        },
        schema,
        { allowUnknown: false },
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("unknown: Unknown field");
    });

    it("should skip validation for undefined fields", () => {
      const schema = {
        name: () => ({ valid: true }),
        age: () => ({ valid: true }),
      };

      const result = validateObject(
        {
          name: "John",
        },
        schema,
      );

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: "John" });
    });
  });

  describe("sanitizeInput", () => {
    it("should trim input by default", () => {
      const result = sanitizeInput("  hello  ");
      expect(result).toBe("hello");
    });

    it("should respect trim option", () => {
      const result = sanitizeInput("  hello  ", { trim: false });
      expect(result).toBe("  hello  ");
    });

    it("should truncate input to maxLength", () => {
      const result = sanitizeInput("hello world", { maxLength: 5 });
      expect(result).toBe("hello");
    });

    it("should handle maxLength with trim", () => {
      const result = sanitizeInput("  hello world  ", {
        trim: true,
        maxLength: 7,
      });
      expect(result).toBe("hello w");
    });

    it("should return non-string input as-is", () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });
});
