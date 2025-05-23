import { createContext } from "react";
import { currentUser } from "../lib/global";

export const userContext = createContext(undefined);
export const settingContext = createContext({});

export function getValueByPath(data, path) {
  return path?.split(".").reduce((obj, i) => obj?.[i], data);
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
  msg["messageType"] = messageType;
  msg["message"] = message;
  sessionStorage.setItem("message", JSON.stringify(msg));
};

export const getReadme = async () => {
  try {
    const response = await fetch("/api/about", { method: "GET" });
    const responseText = await response.text(); // Get text regardless of status for potential error messages

    if (!response.ok) {
      // /api/about might return plain text error or JSON { error: "..." }
      // We want to throw an error that useRequest in useGithubContent can catch
      console.error(`Failed to get readme from /api/about: ${response.status} - ${responseText}`);
      throw new Error(responseText || `Failed to fetch readme. Status: ${response.status}`);
    }
    return responseText; // Success: returns the markdown text
  } catch (error) {
    // Network error or error thrown from !response.ok
    console.error("Network error or other issue in getReadme:", error);
    throw error; // Re-throw for useRequest to handle in its onError
  }
};

export const getRawContent = async (url) => {
  return await fetch(url, {
    method: "GET",
  }).then((res) => {
    return res.text();
  });
};

export const getIssues = async () => {
  try {
    const response = await fetch("/api/issues", { method: "GET" });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore parsing error if response is not JSON
        errorData = { error: `HTTP error! status: ${response.status} - ${response.statusText}` };
      }
      // Log or handle specific error messages from server if available
      console.error('Failed to get issues:', errorData.error || response.statusText);
      // Return a specific error structure that UI components can check
      return { error: true, message: errorData.error || response.statusText, status: response.status, data: [] };
    }
    return await response.json(); // Success: returns array of issues
  } catch (error) {
    // Network error or other issues with fetch itself
    console.error("Network error fetching issues:", error);
    return { error: true, message: error.message, data: [] };
  }
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
  try {
    const response = await fetch(
      "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart",
      { method: "GET" }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get joke:', response.status, errorText);
      throw new Error(`Failed to fetch joke: ${response.status} - ${errorText || response.statusText}`);
    }
    const data = await response.json();
    if (data.error) { // JokeAPI specific error flag
        console.error('JokeAPI returned an error:', data.message || data.causedBy || 'Unknown JokeAPI error');
        throw new Error(data.message || data.causedBy || 'JokeAPI reported an error.');
    }
    return data; // Expected fields: e.g., setup, delivery or joke
  } catch (error) {
    // Log the error and re-throw so useRequest can handle it in its onError callback
    console.error("Error in getJoke:", error.message);
    throw error; 
  }
};

export const getUser = async (username, password) => {
  if (window != undefined) {
    var cached = sessionStorage.getItem(currentUser);
    if (cached) {
      return await JSON.parse(cached);
    }
  }
  return await fetch("https://api.github.com/users/" + username, {
    method: "GET",
    headers: {
      Authorization: "token " + password,
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
  let properties = propertiesString?.split("\n");
  let propertiesJson = [];
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i];
    let propertyJson = {};
    property = property?.split("=");
    if (property[0]) {
      propertyJson["key"] = i;
      propertyJson["name"] = property[0].trim();
      propertyJson["value"] = property[1] ? property[1].trim() : "";
      propertiesJson.push(propertyJson);
    }
  }
  return propertiesJson;
};
