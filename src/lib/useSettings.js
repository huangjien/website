import { useRequest, useSessionStorageState } from "ahooks";
import { createContext, useContext } from "react";
import { properties2Json } from "./Requests";

const getSettings = async () => {
  const response = await fetch("/api/settings", { method: "GET" });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json(); // Server now sends { error: "message" }
    } catch (e) {
      // If error response is not JSON for some reason
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    // Throw an error that ahooks' useRequest can catch in its onError
    // The message from errorData.error will be available in the error object in onError
    throw new Error(errorData.error || `Failed to fetch settings. Status: ${response.status}`);
  }
  return await response.json(); // Success: returns { result: "settings_string..." }
};

const settingContext = createContext();

export function ProvideSettings({ children }) {
  const settings = useProvideSettings();
  return (
    <settingContext.Provider value={settings}>
      {children}
    </settingContext.Provider>
  );
}

export const useSettings = () => {
  return useContext(settingContext);
};

function useProvideSettings() {
  const [settings, setSettings] = useSessionStorageState(
    "application_settings"
  );
  const [languageCode, setLanguageCode] = useSessionStorageState(
    "languageCode",
    { defaultValue: "en-US" }
  );
  const [speakerName, setSpeakerName] = useSessionStorageState("speakerName", {
    defaultValue: "en-US-Standard-A",
  });

  const [currentLanguage, setCurrentLanguage] = useSessionStorageState(
    "Language",
    {
      defaultValue: "en",
    }
  );

  const [currentTheme, setCurrentTheme] = useSessionStorageState("theme", {
    defaultValue: "light",
  });

  useRequest(getSettings, {
    onSuccess: (result) => {
      if (result && result.result) {
        setSettings(properties2Json(result.result));
      }
    },
    cacheTime: -1,
  });

  const getSetting = (key) => {
    var result = undefined;
    if (!settings) {
      return result;
    }
    settings.forEach((setting) => {
      if (setting["name"] === key) {
        result = setting["value"];
      }
    });
    return result;
  };

  return {
    settings,
    getSetting,
    currentLanguage,
    setCurrentLanguage,
    currentTheme,
    setCurrentTheme,
    speakerName,
    setSpeakerName,
    languageCode,
    setLanguageCode,
  };
}
