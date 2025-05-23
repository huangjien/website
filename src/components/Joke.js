/**
 * Joke Component - Displays a random joke with a refresh button
 * Fetches jokes from an API and shows setup/delivery format
 * Uses NextUI components for styling and react-i18next for translation
 */
import { useTranslation } from "react-i18next";
import { useRequest } from "ahooks";
import { getJoke } from "@/lib/Requests";
import { useState, useEffect } from "react"; // Added useEffect
import { BiRefresh } from "react-icons/bi";
import { Spacer } from "@heroui/spacer";
import { Spinner } from "@heroui/react"; // Assuming HeroUI has a Spinner or similar loading component

export const Joke = () => {
  const { t } = useTranslation();
  const { data: jokeData, error, loading, refresh } = useRequest(getJoke, {
    onError: (err) => {
      console.error("Joke component fetch error:", err.message);
    }
  });

  const [title, setTitle] = useState();
  const [content, setContent] = useState();

  useEffect(() => {
    if (jokeData) {
      if (jokeData.type === "twopart" && jokeData.setup && jokeData.delivery) {
        setTitle(jokeData.setup);
        setContent(jokeData.delivery);
      } else if (jokeData.type === "single" && jokeData.joke) {
        setTitle(jokeData.joke);
        setContent(""); // Clear content for single part joke
      } else if (jokeData.error) { // If getJoke returns an error object from its catch block
        setTitle(t('joke.api_error'));
        setContent(jokeData.message || '');
      }
      else {
        // Handle cases where jokeData is present but structure is unexpected or an API error flag is set
        console.warn("Unexpected joke format or API error flag:", jokeData);
        setTitle(t('joke.unexpected_format'));
        setContent("");
      }
    } else if (!loading && !error) {
        // Data is null, not loading, no error - could be initial state before fetch or after an issue
        setTitle(t('joke.no_joke_available'));
        setContent("");
    }
  }, [jokeData, t, loading, error]);

  if (loading) {
    return (
      <div className='z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono'>
        <Spinner size="sm" /> {/* Using a hypothetical Spinner from HeroUI */}
        <Spacer x={2} />
        <span>{t('joke.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono text-red-500'>
        <BiRefresh size='2em' onClick={refresh} title={t('joke.refresh_alt')} />
        <Spacer x={2} />
        {/* Using t() for error message display is better for localization */}
        <span>{t('joke.error', { message: error.message })}</span>
      </div>
    );
  }
  
  if (!title && !loading) { // After loading, if title is still not set (e.g. no joke available)
      return (
        <div className='z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono'>
           <BiRefresh size='2em' onClick={refresh} title={t('joke.refresh_alt')} />
            <Spacer x={2} />
            <span>{t('joke.no_joke_available')}</span>
        </div>
      );
  }
  
  // Ensure class is className for React
  return (
    <div className='z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono'>
      <BiRefresh size='2em' onClick={refresh} title={t('joke.refresh_alt')} />
      <Spacer x={2} />
      {title && <span className='inline-block italic'>{title}</span>}
      {title && content && <Spacer x={2} />} {/* Only show spacer if both title and content exist */}
      {content && <span className='inline-block '><b>{content}</b></span>}
    </div>
  );
};
