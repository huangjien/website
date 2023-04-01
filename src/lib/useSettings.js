import { useRequest } from 'ahooks';
import { createContext, useContext, useState } from 'react';
import { getSettings, properties2Json } from './Requests';

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
  const [settings, setSettings] = useState();
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
      if (setting['name'] === key) {
        result = setting['value'];
      }
    });
    return result;
  };

  return { settings, getSetting };
}
