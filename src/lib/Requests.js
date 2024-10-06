import { createContext } from 'react';
import { currentUser } from '../lib/global';

export const userContext = createContext(undefined);
export const settingContext = createContext({});

export function getValueByPath(data, path) {
  return path?.split('.').reduce((obj, i) => obj?.[i], data);
}

export const hashCode = (string) => {
  var hash = 0;
  if (!string) {
    return 0;
  }
  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const setMessage = (messageType, message) => {
  var msg = {};
  msg['messageType'] = messageType;
  msg['message'] = message;
  sessionStorage.setItem('message', JSON.stringify(msg));
};

export const getReadme = async () => {
  return await fetch('/api/about', {
    method: 'GET',
  }).then((res) => {
    return res.text();
  });
};

export const getRawContent = async (url) => {
  return await fetch(url, {
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

export const isMember = async () => {
  return await fetch('/api/member', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const getJoke = async () => {
  return await fetch(
    'https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart',
    {
      method: 'GET',
    }
  )
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
  let properties = propertiesString?.split('\n');
  let propertiesJson = [];
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i];
    let propertyJson = {};
    property = property?.split('=');
    if (property[0]) {
      propertyJson['key'] = i;
      propertyJson['name'] = property[0].trim();
      propertyJson['value'] = property[1] ? property[1].trim() : '';
      propertiesJson.push(propertyJson);
    }
  }
  return propertiesJson;
};
