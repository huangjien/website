import { useRequest, useSessionStorageState } from 'ahooks';
import { useContext, useEffect, useState } from 'react';
import { HList } from '../components/HList';
import Layout from '../components/layout/Layout';
import { issuesConent } from '../lib/global';
import { getIssues, getOneSetting, settingContext } from '../lib/Requests';

const Index = () => {
  const [setting] = useContext(settingContext);
  const [issueContent, setIssueContent] = useState();
  const [rawData, setRawData] = useState();
  const [listData, setListData] = useSessionStorageState(issuesConent);
  const [labelsList, setLabelsList] = useState([]);

  useRequest(getIssues, {
    onSuccess: (result) => {
      setRawData(JSON.parse(result));
    },
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (setting) {
      var labels = getOneSetting(setting, 'blog.labels');
      var list = labels.split(',');
      setLabelsList(list);
      var issueContent = getOneSetting(setting, 'blog.content');
      var contentList = issueContent.split(',');
      setIssueContent(contentList);
    }
  }, [setting]);

  useEffect(() => {
    if (rawData && issueContent && labelsList) {
      // forEach rawDate content, check its labels.name, if it is in labelList, then only record data in the issueContent
      var finalResult = [];
      rawData.forEach((issue) => {
        var labels = issue['labels'];
        var isVisible = false;
        var labelArray = [];
        // console.log(labelsList)
        labels.forEach((label) => {
          // console.log(label['name'])
          if (labelsList.includes(label['name'])) {
            // console.log(issue)
            isVisible = true;
            labelArray.push(label.name);
          }
        });
        if (isVisible) {
          // then we start handle this issue: we only care the the content in the issueContent
          var content = {};
          issueContent.forEach((key) => {
            if (key === 'labels.name') {
              content[key] = labelArray;
            } else {
              content[key] = issue[key];
            }
          });
          // then we save this issue to the data
          finalResult.push(content);
        }
      });
      setListData(finalResult);
    }
  }, [issueContent, rawData]);
  return (
    <Layout>
      <HList header={labelsList} data={listData} />
    </Layout>
  );
};
export default Index;
