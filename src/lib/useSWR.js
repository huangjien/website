import useSWR from "swr";

const fetcher = (url) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      return res.text();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      throw error;
    });

export function useIssues() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/issues",
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      shouldRetryOnError: true,
    },
  );
  return { issues: data, error, isLoading, isValidating, mutate };
}

export function useReadme() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/about",
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      shouldRetryOnError: true,
    },
  );
  return { readme: data, error, isLoading, isValidating, mutate };
}

export function useLabels() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/labels",
    fetcher,
    {
      dedupingInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );
  return { labels: data, error, isLoading, isValidating, mutate };
}

export function useMember() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/member",
    fetcher,
    {
      dedupingInterval: 300000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );
  return { member: data, error, isLoading, isValidating, mutate };
}

export { fetcher };
