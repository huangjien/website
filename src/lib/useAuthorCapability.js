import { useRequest } from "ahooks";

const getAuthorCapability = async () => {
  const response = await fetch("/api/author");
  if (!response.ok) {
    throw new Error("Failed to verify publishing access");
  }
  return response.json();
};

export const useAuthorCapability = () => {
  const { data, loading, error, refresh } = useRequest(getAuthorCapability, {
    cacheKey: "blog-author-capability",
    staleTime: 5 * 60 * 1000,
  });

  return {
    authenticated: Boolean(data?.authenticated),
    canPublish: Boolean(data?.canPublish),
    loading,
    error,
    refresh,
  };
};
