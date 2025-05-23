import { useRequest, useLocalStorageState } from "ahooks";
import { useEffect, useState } from "react";
import { getIssues, getReadme, getValueByPath } from "./Requests";
import { useSettings } from "./useSettings";

export const useGithubContent = () => {
  const { getSetting } = useSettings();
  const [about, setAbout] = useLocalStorageState("about");
  const [rawData, setRawData] = useState();
  const [issues, setIssues] = useLocalStorageState("issues");
  const [tags, setTags] = useState();

  useRequest(getReadme, {
    onSuccess: (result) => {
      // result should be the markdown text on success
      setAbout(result);
    },
    onError: (error) => {
      console.error("Error fetching readme in useGithubContent:", error.message);
      setAbout("Failed to load about content. Please try again later."); // Set an error message for display
    }
  });

  useRequest(getIssues, {
    onSuccess: (result) => {
      if (result && !result.error) { // Check if result is not an error object and has data
        setRawData(result); // result is already a JS object/array
      } else if (result && result.error) {
        console.error("Failed to fetch issues in useGithubContent:", result.message);
        setRawData([]); // Set to empty array or handle error state appropriately
        setIssues([]); // Also clear issues
      } else {
        // Handle unexpected result structure, though getIssues should prevent this
        console.error("Unexpected result from getIssues:", result);
        setRawData([]);
        setIssues([]);
      }
    },
    onError: (error) => { // Good practice to add onError for useRequest
      console.error("Error in useRequest for getIssues:", error.message);
      setRawData([]);
      setIssues([]);
    },
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (rawData) {
      // console.log(rawData)
      const blog_labels = getSetting("blog.labels");
      const issueContent = getSetting("blog.content");
      const issueContentList = issueContent?.split(",");

      if (blog_labels && issueContent) {
        const list = blog_labels?.split(",");
        setTags(list);

        let finalResult = [];
        rawData.forEach((issue) => {
          const labels = issue["labels"];
          let isVisible = false;
          let labelArray = [];
          labels.forEach((label) => {
            // console.log(label['name'])
            if (list.includes(label["name"])) {
              isVisible = true;
              labelArray.push(label.name);
            }
          });
          if (isVisible) {
            // then we start handle this issue: we only care the the content in the issueContent
            let content = extractContentAccordingContentList(
              issueContentList,
              issue
            );
            content["labels.name"] = labelArray;
            // console.log(content)
            finalResult.push(content);
          }
        });
        setIssues(finalResult);
      }
    }
  }, [getSetting, setIssues, rawData]);

  return { tags, issues, about };
};

// extract a new subset from the content, according content list, then add a html field according body
export function extractContentAccordingContentList(
  contentList,
  originalContent
) {
  let content = {};
  contentList.forEach((key) => {
    content[key] = getValueByPath(originalContent, key);
  });
  return content;
}
