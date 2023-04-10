import { useRequest, useSessionStorageState } from 'ahooks';
import { useEffect, useState } from 'react';
import { getIssues, getReadme, getValueByPath, hashCode } from './Requests';
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
      const issueContentList = issueContent.split(',');
      const commentContent = getSetting('comment.content');
      const commentContentList = commentContent.split(',');
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
              issue,
              getHtml
            );
            content['labels.name'] = labelArray;
            // now, we need to check if it contains comments,
            // if yes, then we need to add the comments to content,
            // of course, we need to translate them into html format

            if (content?.comments > 0) {
              // get comments
              // console.log(content)
              const commentList = [];
              // get comments according number
              fetch('/api/comments/' + content.number, {
                method: 'GET',
              })
                .then((res) => res.json())
                .then((comment) => {
                  // console.log(comment);
                  // foreach to handle a comments array here
                  comment.forEach((oneComment) => {
                    const oneCommentContent =
                      extractContentAccordingContentList(
                        commentContentList,
                        oneComment,
                        getHtml
                      );
                    commentList.push(oneCommentContent);
                  });
                });

              content['commentList'] = commentList;
            }

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
      return await translated;
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

// extract a new subset from the content, according content list, then add a html field according body
function extractContentAccordingContentList(
  contentList,
  originalContent,
  getHtml
) {
  var content = {};
  contentList.forEach((key) => {
    content[key] = getValueByPath(originalContent, key);
    if (key === 'body') {
      // console.log(key, issue[key]);
      getHtml(originalContent[key]).then((html) => {
        // console.log(html);
        content['html'] = html;
      });
    }
  });
  return content;
}
