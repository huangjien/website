const metricsStore = {
  requests: {},
  errors: {},
};

const DURATION_BUCKETS = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

const getBucket = (durationMs) => {
  for (const bucket of DURATION_BUCKETS) {
    if (durationMs <= bucket) {
      return bucket;
    }
  }
  return DURATION_BUCKETS[DURATION_BUCKETS.length - 1] + 1;
};

export const recordRequest = (route, method, status, durationMs) => {
  const key = `${route}:${method}:${status}`;

  if (!metricsStore.requests[key]) {
    metricsStore.requests[key] = {
      route,
      method,
      status,
      count: 0,
      durations: [],
      buckets: {},
    };
  }

  const metric = metricsStore.requests[key];
  metric.count += 1;
  metric.durations.push(durationMs);

  const bucket = getBucket(durationMs);
  metric.buckets[bucket] = (metric.buckets[bucket] || 0) + 1;
};

export const recordError = (route, errorType) => {
  const key = `${route}:${errorType}`;

  if (!metricsStore.errors[key]) {
    metricsStore.errors[key] = {
      route,
      errorType,
      count: 0,
    };
  }

  metricsStore.errors[key].count += 1;
};

export const getMetrics = () => {
  const requests = Object.values(metricsStore.requests).map((metric) => {
    const sortedDurations = [...(metric.durations || [])].sort((a, b) => a - b);
    const count = sortedDurations.length;

    let p50 = 0;
    let p95 = 0;
    let p99 = 0;

    if (count > 0) {
      const p50Index = Math.floor((count - 1) * 0.5);
      const p95Index = Math.floor((count - 1) * 0.95);
      const p99Index = Math.floor((count - 1) * 0.99);

      p50 = sortedDurations[p50Index];
      p95 = sortedDurations[p95Index];
      p99 = sortedDurations[p99Index];
    }

    return {
      route: metric.route,
      method: metric.method,
      status: metric.status,
      count: metric.count,
      durations: sortedDurations,
      buckets: metric.buckets,
      percentiles: { p50, p95, p99 },
    };
  });

  const errors = Object.values(metricsStore.errors).map((metric) => ({
    route: metric.route,
    errorType: metric.errorType,
    count: metric.count,
  }));

  return {
    requests,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export const resetMetrics = () => {
  metricsStore.requests = {};
  metricsStore.errors = {};
};

export const withMetrics = (handler) => {
  return async (req, res) => {
    const startTime = Date.now();
    const route = req?.url || "unknown";

    try {
      const result = await handler(req, res);
      const durationMs = Date.now() - startTime;
      recordRequest(
        route,
        req?.method || "UNKNOWN",
        res?.statusCode || 200,
        durationMs,
      );
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      recordRequest(
        route,
        req?.method || "UNKNOWN",
        res?.statusCode || 500,
        durationMs,
      );
      recordError(route, error?.name || "Error");
      throw error;
    }
  };
};
