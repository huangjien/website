export const sanitizeHtml = (input) => {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const sanitizeMarkdown = (input) => {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gis,
    /<iframe[^>]*>.*?<\/iframe>/gis,
    /<object[^>]*>.*?<\/object>/gis,
    /<embed[^>]*>/gis,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*onerror[^>]*>/gi,
  ];

  dangerousPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized;
};

export const validateEmail = (email) => {
  if (typeof email !== "string") {
    return { valid: false, error: "Email must be a string" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

export const validateUrl = (url) => {
  if (typeof url !== "string" || url.trim() === "") {
    return { valid: false, error: "URL must be a non-empty string" };
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS protocol" };
    }
    return { valid: true, url: parsed.href };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
};

export const validateStringLength = (input, options = {}) => {
  const {
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    fieldName = "field",
    required = false,
  } = options;

  if (input === undefined || input === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  if (typeof input !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const length = input.length;

  if (length < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min} characters`,
    };
  }

  if (length > max) {
    return {
      valid: false,
      error: `${fieldName} must be no more than ${max} characters`,
    };
  }

  return { valid: true };
};

export const validateNumber = (value, options = {}) => {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    fieldName = "field",
    required = false,
    integer = false,
  } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, value: num };
};

export const validateEnum = (value, allowedValues, options = {}) => {
  const { fieldName = "field", required = false } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
    };
  }

  return { valid: true };
};

export const validateObject = (obj, schema, options = {}) => {
  const { allowUnknown = true } = options;
  const errors = [];
  const sanitized = {};

  for (const [key, validator] of Object.entries(schema)) {
    const value = obj[key];
    const result = validator(value, key);

    if (!result.valid) {
      errors.push(`${key}: ${result.error}`);
    } else if (result.value !== undefined) {
      sanitized[key] = result.value;
    } else if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  if (!allowUnknown) {
    for (const key of Object.keys(obj)) {
      if (!schema[key]) {
        errors.push(`${key}: Unknown field`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized };
};

export const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const result = validateObject(req.body, schema);

    if (!result.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.errors,
      });
    }

    req.validatedBody = result.data;
    next();
  };
};

export const sanitizeInput = (input, options = {}) => {
  const { trim = true, maxLength } = options;

  if (typeof input !== "string") {
    return input;
  }

  let sanitized = input;

  if (trim) {
    sanitized = sanitized.trim();
  }

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
};
