import { logApiEvent } from "../apiClient";
import { recordError, recordRequest } from "../metrics";

/**
 * Builds a mutation failure handler for an API route. The returned handler
 * records request/error metrics, emits a structured warning log, and rethrows
 * the error so the route's error handling can translate it into a response.
 *
 * @param {Object} options - Handler configuration.
 * @param {string} options.route - API route used as the metrics key (e.g. "/api/issues").
 * @param {string} options.eventName - Structured log event name (e.g. "issue_post_failure").
 * @param {Object} options.req - The Next.js API request object, used for logging context.
 * @param {() => (number | null)} options.getStartMs - Accessor returning the current
 *   mutation start timestamp, or null before the mutation began.
 * @returns {(error: Error, reason: string) => never} Handler that records telemetry and rethrows.
 */
export const createMutationFailureHandler = ({
  route,
  eventName,
  req,
  getStartMs,
}) => {
  return function handleMutationFailure(error, reason) {
    const status = error?.status || 500;
    const mutationStartMs = getStartMs();
    const durationMs =
      mutationStartMs === null ? 0 : Math.max(0, Date.now() - mutationStartMs);
    recordRequest(route, "POST", status, durationMs);
    recordError(route, error?.name || "Error");
    logApiEvent("warn", eventName, req, {
      reason,
      status,
      errorName: error?.name || "Error",
      durationMs,
    });
    throw error;
  };
};
