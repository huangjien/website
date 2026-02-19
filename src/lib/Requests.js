import { createContext } from "react";
import { currentUser } from "../lib/global";

export const userContext = createContext(undefined);
export const settingContext = createContext({});

export function getValueByPath(data, path) {
  if (path === null || path === undefined) {
    return undefined;
  }
  if (path === "") {
    return data;
  }
  return path.split(".").reduce((obj, i) => obj?.[i], data);
}

export const hashCode = (string) => {
  let hash = 0;
  if (!string) {
    return 0;
  }
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const setMessage = (messageType, message) => {
  const msg = {};
  msg["messageType"] = messageType;
  msg["message"] = message;
  sessionStorage.setItem("message", JSON.stringify(msg));
};

export const getReadme = async () => {
  return await fetch("/api/about", {
    method: "GET",
  }).then((res) => {
    return res.text();
  });
};

export const getRawContent = async (url) => {
  return await fetch(url, {
    method: "GET",
  }).then((res) => {
    return res.text();
  });
};

export const getIssues = async () => {
  return await fetch("/api/issues", {
    method: "GET",
  }).then((res) => {
    return res.text();
  });
};

export const getLabels = async () => {
  return await fetch("/api/labels", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const isMember = async () => {
  return await fetch("/api/member", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const getJoke = async () => {
  return await fetch(
    "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart",
    {
      method: "GET",
    },
  )
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const getUser = async (username, password) => {
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(currentUser);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        sessionStorage.removeItem(currentUser);
      }
    }
  }

  const response = await fetch("https://api.github.com/users/" + username, {
    method: "GET",
    headers: {
      Authorization: "token " + password,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(currentUser, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to cache user data:", e);
    }
  }

  return data;
};

export const properties2Json = (propertiesString) => {
  if (!propertiesString) {
    return [];
  }

  const properties = propertiesString.split("\n");
  const propertiesJson = [];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (!property) continue;

    const eqIndex = property.indexOf("=");

    if (eqIndex === -1) {
      propertiesJson.push({
        key: i,
        name: property.trim(),
        value: "",
      });
    } else {
      propertiesJson.push({
        key: i,
        name: property.slice(0, eqIndex).trim(),
        value: property.slice(eqIndex + 1).trim(),
      });
    }
  }

  return propertiesJson;
};
