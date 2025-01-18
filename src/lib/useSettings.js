import { useRequest, useSessionStorageState } from "ahooks";
import { createContext, useContext } from "react";
import { properties2Json } from "./Requests";

const getSettings = async () => {
  return await fetch("/api/settings", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
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
