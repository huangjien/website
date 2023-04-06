import { useRequest, useSessionStorageState } from 'ahooks';
import { useEffect, useState } from 'react';
import { getIssues, getReadme, hashCode } from './Requests';
import { useSettings } from './useSettings';

export const useGithubContent = () => {
  const { getSetting } = useSettings();
  const [about, setAbout] = useSessionStorageState('about');
  const [rawData, setRawData] = useState();
  const [issues, setIssues] = useSessionStorageState('issues');
  const [tags, setTags] = useState();

  useRequest(getReadme, {
    onSuccess: (result) => {
      getHtml(result).then((content) => setAbout(content));
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
      if (blog_labels && issueContent) {
        const list = blog_labels.split(',');
        setTags(list);
        const issueContentList = issueContent.split(',');
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
            var content = {};
            issueContentList.forEach((key) => {
              if (key === 'labels.name') {
                content[key] = labelArray;
              } else {
                content[key] = issue[key];
                if (key === 'body') {
                  // console.log(key, issue[key]);
                  getHtml(issue[key]).then((html) => {
                    // console.log(html);
                    content['html'] = html;
                  });
                }
              }
            });
            // then we save this issue to the data
            finalResult.push(content);
          }
        });
        setIssues(finalResult);
      }
    }
  }, [getSetting, rawData]);

  const getHtml = async (markdown) => {
    // console.log(markdown)
    const hash = hashCode(markdown);
    const translated = sessionStorage.getItem(`${hash}`);
    if (translated) {
      return translated;
    }
    return await fetch('/api/markdown', {
      method: 'POST',
      body: markdown,
    })
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem(`${hash}`, data);
        return data;
      });
  };

  return { tags, issues, about, getHtml };
};
