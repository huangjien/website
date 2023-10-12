import {
  useRequest,
  useSessionStorageState,
  useLocalStorageState,
} from 'ahooks';
import { useEffect, useState } from 'react';
import { getIssues, getReadme, getValueByPath, hashCode } from './Requests';
import { useSettings } from './useSettings';
import { content } from '../../tailwind.config';

export const useGithubContent = () => {
  const { getSetting } = useSettings();
  const [about, setAbout] = useLocalStorageState('about');
  const [rawData, setRawData] = useState();
  const [issues, setIssues] = useLocalStorageState('issues');
  const [tags, setTags] = useState();

  useRequest(getReadme, {
    onSuccess: (result) => {
      setAbout(result);
    },
  });

  useRequest(getIssues, {
    onSuccess: (result) => {
      setRawData(JSON.parse(result));
    },
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (rawData) {
      // console.log(rawData)
      const blog_labels = getSetting('blog.labels');
      const issueContent = getSetting('blog.content');
      const issueContentList = issueContent.split(',');

      if (blog_labels && issueContent) {
        const list = blog_labels.split(',');
        setTags(list);

        var finalResult = [];
        rawData.forEach((issue) => {
          const labels = issue['labels'];
          var isVisible = false;
          var labelArray = [];
          labels.forEach((label) => {
            // console.log(label['name'])
            if (list.includes(label['name'])) {
              // console.log(issue);
              isVisible = true;
              labelArray.push(label.name);
            }
          });
          // console.log(isVisible, labels);
          if (isVisible) {
            // then we start handle this issue: we only care the the content in the issueContent
            var content = extractContentAccordingContentList(
              issueContentList,
              issue
            );
            content['labels.name'] = labelArray;
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
  var content = {};
  contentList.forEach((key) => {
    content[key] = getValueByPath(originalContent, key);
  });
  return content;
}
