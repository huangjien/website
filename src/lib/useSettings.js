import { useRequest, useSessionStorageState } from "ahooks";
import { createContext, useContext, useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [currentStyle, setCurrentStyle] = useSessionStorageState(
    "designStyle",
    {
      defaultValue: "glassmorphism",
    }
  );

  useRequest(getSettings, {
    onSuccess: (result) => {
      if (result && result.result) {
        setSettings(properties2Json(result.result));
      }
    },
    cacheTime: -1,
  });

  const getSetting = (key) => {
    let result = undefined;
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
    settings: mounted ? settings : undefined,
    getSetting,
    currentLanguage: mounted ? currentLanguage : "en",
    setCurrentLanguage,
    currentTheme: mounted ? currentTheme : "light",
    setCurrentTheme,
    currentStyle: mounted ? currentStyle : "glassmorphism",
    setCurrentStyle,
    speakerName: mounted ? speakerName : "en-US-Standard-A",
    setSpeakerName,
    languageCode: mounted ? languageCode : "en-US",
    setLanguageCode,
  };
}
