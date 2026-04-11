const getRetryAfterSeconds = (response, payload) => {
  const payloadRetryAfter =
    typeof payload?.retryAfter === "number" ? payload.retryAfter : null;
  if (payloadRetryAfter !== null && Number.isFinite(payloadRetryAfter)) {
    return Math.max(1, Math.ceil(payloadRetryAfter));
  }

  const retryAfterHeader = response?.headers?.get?.("Retry-After");
  const headerValue = Number.parseInt(retryAfterHeader || "", 10);
  if (Number.isFinite(headerValue) && headerValue > 0) {
    return headerValue;
  }

  return null;
};

export const parseMutationErrorPayload = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const getMutationErrorMessage = ({
  response,
  payload,
  t,
  authKey,
  validationKey,
  rateLimitKey,
  timeoutKey,
  serverKey,
  fallbackKey,
  fallbackDefaultValue,
}) => {
  const status = response?.status || 0;
  const errorText =
    typeof payload?.error === "string" ? payload.error.trim() : "";

  if (status === 401 || status === 403) {
    return t(authKey, {
      defaultValue: "Your session expired. Please sign in and retry.",
    });
  }

  if (status === 400) {
    return errorText
      ? errorText
      : t(validationKey, {
          defaultValue: "Please check your input and try again.",
        });
  }

  if (status === 429) {
    const retryAfterSeconds = getRetryAfterSeconds(response, payload);
    if (retryAfterSeconds !== null) {
      return t(rateLimitKey, {
        seconds: retryAfterSeconds,
        defaultValue:
          "Rate limit reached. Please wait {{seconds}} seconds and retry.",
      });
    }
    return t(rateLimitKey, {
      defaultValue: "Rate limit reached. Please wait and retry.",
    });
  }

  if (status === 504 || errorText.toLowerCase().includes("timed out")) {
    return t(timeoutKey, {
      defaultValue:
        "The request timed out while contacting GitHub. Please retry.",
    });
  }

  if (status >= 500) {
    return t(serverKey, {
      defaultValue: "The server could not process the request. Please retry.",
    });
  }

  return errorText || t(fallbackKey, { defaultValue: fallbackDefaultValue });
};
