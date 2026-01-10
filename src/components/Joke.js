/**
 * Joke Component - Displays a random joke with a refresh button
 * Fetches jokes from an API and shows setup/delivery format
 * Uses NextUI components for styling and react-i18next for translation
 */
import { useTranslation } from "react-i18next";
import { useRequest } from "ahooks";
import Button from "./ui/button";
import { MdRefresh } from "react-icons/md";

export const Joke = () => {
  const { t } = useTranslation();

  // Fetch joke data from API
  const fetchJoke = async () => {
    const response = await fetch("/api/joke");
    if (!response.ok) {
      throw new Error("Failed to fetch joke");
    }
    return response.json();
  };

  const { data, loading, error, refresh } = useRequest(fetchJoke, {
    manual: false,
    refreshDeps: [],
  });

  // Show error message if there's an error
  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Button
          variant='ghost'
          size='icon'
          onClick={refresh}
          disabled={loading}
          aria-busy={loading ? "true" : undefined}
          aria-label={t("joke.refresh")}
          title={t("joke.refresh")}
          className={`${loading ? "animate-spin-slow" : "hover:rotate-180"} transition-transform duration-normal ease-out`}
        >
          <MdRefresh />
        </Button>
        <span>{t("joke.error")}</span>
      </div>
    );
  }

  // Show loading message when loading and no data
  if (loading && !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Button
          variant='ghost'
          size='icon'
          onClick={refresh}
          disabled={loading}
          aria-busy={loading ? "true" : undefined}
          aria-label={t("joke.refresh")}
          title={t("joke.refresh")}
          className={`${loading ? "animate-spin-slow" : "hover:rotate-180"} transition-transform duration-normal ease-out`}
        >
          <MdRefresh />
        </Button>
        <span>{t("joke.loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Button
        variant='ghost'
        size='icon'
        onClick={refresh}
        disabled={loading}
        aria-busy={loading ? "true" : undefined}
        aria-label={t("joke.refresh")}
        title={t("joke.refresh")}
        className={`${loading ? "animate-spin-slow" : "hover:rotate-180"} transition-transform duration-normal ease-out`}
      >
        <MdRefresh />
      </Button>
      {data?.joke && <span className='animate-slide-up'>{data.joke}</span>}
    </div>
  );
};
