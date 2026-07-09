import { checkRateLimit } from "./rateLimit";
import { randomUUID } from "node:crypto";

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

class NetworkError extends ApiError {
  constructor(message = "Network error occurred") {
    super(message, 500);
    this.name = "NetworkError";
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

class AuthenticationError extends ApiError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

class RateLimitError extends ApiError {
  constructor(retryAfter, resetAt) {
    super("Rate limit exceeded", 429, { retryAfter, resetAt });
    this.name = "RateLimitError";
  }
}

const toHeaderString = (value) => {
  if (Array.isArray(value)) {
    return `${value[0] || ""}`.trim();
  }
  return `${value || ""}`.trim();
};

export const getRequestId = (req) => {
  const existingRequestId = toHeaderString(req?.headers?.["x-request-id"]);
  if (existingRequestId) {
    return existingRequestId;
  }

  const existingCorrelationId = toHeaderString(
    req?.headers?.["x-correlation-id"],
  );
  if (existingCorrelationId) {
    return existingCorrelationId;
  }

  return randomUUID();
};

export const logApiEvent = (level, event, req, fields = {}) => {
  const clientIp = (() => {
    if (!req?.headers) return "unknown";
    return getClientIp(req);
  })();

  const payload = {
    level,
    event,
    requestId: req?.requestId || (req ? getRequestId(req) : "unknown"),
    method: req?.method || "UNKNOWN",
    route: req?.url || "UNKNOWN",
    timestamp: new Date().toISOString(),
    userAgent: req?.headers?.["user-agent"] || null,
    clientIp,
    contentLength: req?.headers?.["content-length"] || null,
    ...fields,
  };
  console[level](JSON.stringify(payload));
};

export const withErrorHandling = (handler) => {
  return async (req, res) => {
    const startTime = Date.now();
    const requestId = getRequestId(req);
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    try {
      const result = await handler(req, res);
      const durationMs = Date.now() - startTime;
      logApiEvent("info", "api_request", req, {
        status: res.statusCode || 200,
        durationMs,
      });
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logApiEvent("error", "api_error", req, {
        errorName: error?.name || "Error",
        errorMessage: error?.message || "Unknown error",
        status: error?.status || 500,
        durationMs,
      });

      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: error.message,
          details: error.details,
        });
      }

      if (error instanceof AuthenticationError) {
        return res.status(401).json({ error: error.message });
      }

      if (error instanceof RateLimitError) {
        res.setHeader("X-RateLimit-Limit", "20");
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", error.details.resetAt.toString());
        return res.status(429).json({
          error: error.message,
          retryAfter: error.details.retryAfter,
        });
      }

      if (error instanceof ApiError) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
        });
      }

      const errorMessage = error.message || "Internal Server Error";
      return res.status(500).json({
        error: errorMessage,
      });
    }
  };
};

export const withRateLimit = (requests, windowMs) => {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      "unknown";

    const result = checkRateLimit(ip, requests, windowMs);

    res.setHeader("X-RateLimit-Limit", requests.toString());
    res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
    res.setHeader("X-RateLimit-Reset", result.resetAt.toString());

    if (!result.allowed) {
      throw new RateLimitError(
        Math.ceil((result.resetAt - Date.now()) / 1000),
        result.resetAt,
      );
    }

    next();
  };
};

export const withMethod = (allowedMethods) => {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      res.setHeader("Allow", allowedMethods.join(", "));
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    next();
  };
};

export const ensureMethod = (req, res, allowedMethods) => {
  if (allowedMethods.includes(req.method)) {
    return true;
  }

  res.setHeader("Allow", allowedMethods.join(", "));
  res.status(405).json({ error: "Method Not Allowed" });
  return false;
};

export const getOpenAiApiKey = () =>
  process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;

export const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.headers["x-real-ip"] ||
  "unknown";

export {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
};
