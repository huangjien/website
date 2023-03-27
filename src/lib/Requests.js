import { createContext } from 'react';
import { currentUser } from '../lib/global';

export const userContext = createContext(undefined);
export const settingContext = createContext({});

export const getSetting = async () => {
  return await fetch('/api/settings', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const hashCode = (string) => {
  var hash = 0;
  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const getMarkDownHtml = async (content) => {
  // check the local storage with hashCode, if matched, save the time to access the github
  const hash = hashCode(content);
  const translated = localStorage.getItem(`${hash}`);
  if (translated) {
    return await translated;
  }

  return await fetch('/api/markdown', {
    method: 'POST',
    body: content,
  })
    .then((res) => res.text())
    .then((data) => {
      localStorage.setItem(`${hash}`, data);
      return data;
    });
};

export const getReadme = async () => {
  return await fetch('/api/about', {
    method: 'GET',
  }).then((res) => {
    return res.text();
  });
};

export const getIssues = async () => {
  return await fetch('/api/issues', {
    method: 'GET',
  }).then((res) => {
    return res.text();
  });
};

export const getLabels = async () => {
  return await fetch('/api/labels', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const getUser = async (username, password) => {
  if (window != undefined) {
    var cached = sessionStorage.getItem(currentUser);
    if (cached) {
      return await JSON.parse(cached);
    }
  }
  return await fetch('https://api.github.com/users/' + username, {
    method: 'GET',
    headers: {
      Authorization: 'token ' + password,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

export const properties2Json = (propertiesString) => {
  if (!propertiesString) {
    return [];
  }
  let properties = propertiesString.split('\n');
  let propertiesJson = [];
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i];
    let propertyJson = {};
    property = property.split('=');
    if (property[0]) {
      propertyJson['key'] = i;
      propertyJson['name'] = property[0].trim();
      propertyJson['value'] = property[1] ? property[1].trim() : '';
      propertiesJson.push(propertyJson);
    }
  }
  return propertiesJson;
};

export const getOneSetting = (settings, key) => {
  var result = undefined;
  if (!settings) {
    return result;
  }
  settings.forEach((setting) => {
    if (setting['name'] === key) {
      result = setting['value'];
    }
  });
  // console.log(result)
  return result;
};
