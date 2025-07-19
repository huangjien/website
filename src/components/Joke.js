/**
 * Joke Component - Displays a random joke with a refresh button
 * Fetches jokes from an API and shows setup/delivery format
 * Uses NextUI components for styling and react-i18next for translation
 */
import { useTranslation } from "react-i18next";
import { useRequest } from "ahooks";
import { Button, Spacer } from "@heroui/react";
import { MdRefresh } from "react-icons/md";

export const Joke = () => {
  const { t } = useTranslation();

  // Fetch joke data from API
  const fetchJoke = async () => {
    const response = await fetch('/api/joke');
    if (!response.ok) {
      throw new Error('Failed to fetch joke');
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
      <div>
        <span>{t('joke.error')}</span>
        <Spacer />
        <Button
          color="primary"
          variant="flat"
          onPress={refresh}
          isLoading={loading}
          startContent={<MdRefresh />}
        >
          {t('joke.refresh')}
        </Button>
      </div>
    );
  }

  // Show loading message when loading and no data
  if (loading && !data) {
    return (
      <div>
        <span>{t('joke.loading')}</span>
        <Spacer />
        <Button
          color="primary"
          variant="flat"
          onPress={refresh}
          isLoading={loading}
          startContent={<MdRefresh />}
        >
          {t('joke.refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {data?.joke && <span>{data.joke}</span>}
      <Spacer />
      <Button
        color="primary"
        variant="flat"
        onPress={refresh}
        isLoading={loading}
        startContent={<MdRefresh />}
      >
        {t('joke.refresh')}
      </Button>
    </div>
  );
};
